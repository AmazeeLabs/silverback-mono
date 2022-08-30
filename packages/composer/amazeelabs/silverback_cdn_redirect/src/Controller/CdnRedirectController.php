<?php

namespace Drupal\silverback_cdn_redirect\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Path\PathValidatorInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\silverback_cdn_redirect\EventSubscriber\CdnRedirectRouteSubscriber;
use GuzzleHttp\ClientInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


class CdnRedirectController extends ControllerBase {
  /**
   * The URL generator service.
   *
   * @var \Drupal\Core\Routing\UrlGeneratorInterface
   */
  protected $urlGenerator;

  /**
   * @var \GuzzleHttp\ClientInterface
   */
  protected $client;

  /**
   * @var \Drupal\Core\Path\PathValidatorInterface
   */
  protected $pathValidator;

  /**
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  protected $cacheHeaders;
  protected $cdnAuthParams = null;

  /**
   * Creates a CdnRedirectController object.
   */
  public function __construct(
    UrlGeneratorInterface $url_generator,
    ClientInterface $client,
    PathValidatorInterface $pathValidator,
    ModuleHandlerInterface $moduleHandler,
    EntityTypeManagerInterface $entityTypeManager
  ) {
    $this->urlGenerator = $url_generator;
    $this->entityTypeManager = $entityTypeManager;
    $this->client = $client;
    $this->cacheHeaders = [
      // Five minutes cache for 404 and redirect responses.
      'cache-control' => 'public, max-age=' . 60*5,
    ];

    $settings = \Drupal::config('silverback_cdn_redirect.settings');
    if ($password = $settings->get('netlify_password')) {
      $this->cdnAuthParams = [
        'form_params' => [
          'password' => $password,
        ],
      ];
    }
    $this->pathValidator = $pathValidator;
    $this->moduleHandler = $moduleHandler;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('url_generator'),
      $container->get('silverback_cdn_redirect.http_client'),
      $container->get('path.validator'),
      $container->get('module_handler'),
      $container->get('entity_type.manager')
    );
  }

  public function handle(string $path, Request $request) {
    $settings = \Drupal::config('silverback_cdn_redirect.settings');
    $baseUrl = $settings->get('base_url');
    $notFoundPath = $settings->get('404_path');
    if (!$baseUrl || !$notFoundPath) {
      return new Response('The module is not configured', 500);
    }


    $location = NULL;
    $responseCode = NULL;

    $queryString = $request->getQueryString();
    $uri = '/' . $path . ($queryString === NULL ? '' : '?' . $queryString);

    $subRequest = Request::create($uri, 'GET', [], [], [], $request->server->all());
    $subRequest->attributes->set('_silverback_cdn_redirect', TRUE);
    /** @var \Symfony\Component\HttpKernel\HttpKernelInterface $httpKernel */
    $httpKernel = \Drupal::service('http_kernel');
    $response = $httpKernel->handle($subRequest);

    if ($response->isRedirection()) {
      $location = $response->headers->get('location');
      $parts = parse_url($location);
      $isRelative = empty($parts['scheme']) && empty($parts['host']);
      $linksToCurrentHost = $parts['host'] === $request->getHost() &&
        (
          (
            isset($parts['port']) && $parts['port'] == $request->getPort()
          ) ||
          !isset($parts['port'])
        );
      if ($isRelative || $linksToCurrentHost) {
        $location = $baseUrl .
          ($parts['path'] ?? '') .
          (isset($parts['query']) ? "?{$parts['query']}" : '');
      }
      $responseCode = $response->getStatusCode();
    } elseif ($response->getStatusCode() === 200) {

      if (($url = $this->pathValidator->getUrlIfValidWithoutAccessCheck($path)) && $url->isRouted() && $url->access()) {
        // Check if the path leads to an entity. In that case we (might) want to
        // display a client side rendered template.
        [, $type] = explode('.', $url->getRouteName());
        $parameters = $url->getRouteParameters();
        if ($type && isset($parameters[$type]) && $id = $parameters[$type]) {
          $entity = $this->entityTypeManager->getStorage($type)->load($id);
          if ($entity && $response = $this->rewriteToCDN($baseUrl . '/___csr', 200, $entity->getEntityTypeId() . ':' . $entity->bundle(), $entity->id())) {
            return $response;
          }
        }
      }

      // If the returned response is not a redirect, we still want to check if
      // there is a path alias for the current path. If it exists, then we
      // should redirect to it.
      $routeUri = $this->urlGenerator->generateFromRoute('<current>', [], []);
      if ($routeUri !== '/' . $path) {
        $location = $baseUrl .
          $routeUri .
          (is_null($queryString) ? '' : '?' . $queryString);
        $responseCode= 301;
      }
    }

    if (!$location || !$responseCode) {
      $prefix = (
        $settings->get('should_prefix_404_path') &&
        CdnRedirectRouteSubscriber::$currentLangcode &&
        ($prefixes = \Drupal::config('language.negotiation')->get('url.prefixes')) &&
        ($prefix = $prefixes[CdnRedirectRouteSubscriber::$currentLangcode])
      )
        ? '/' . $prefix
        : '';

      // Fallback behavior: redirect to 404 page.
      $location = $baseUrl . $prefix . $notFoundPath;
      $responseCode = 302;
      if ($response = $this->rewriteToCDN($location, 404)) {
        return $response;
      }
    }

    if ($location === $baseUrl . $uri) {
      return new Response('Circular redirect', 500);
    }

    $response = new TrustedRedirectResponse($location, $responseCode, $this->cacheHeaders);
    // Vary the cache by the full URL. Otherwise, it can happen that
    // "backend.site/node/123" will lead to "frontend.site/node-alias" because
    // the redirect was already cached for "backend.site/cdn-redirect/node/123".
    $response->getCacheableMetadata()->addCacheContexts(['url']);
    return $response;
  }

  protected function rewriteToCDN($location, $statusCode, $type = null , $id = null) {
    // Desired behavior: fetch the 404 page and return its contents.
    $response = $this->client->request('GET', $location);
    if ($response->getStatusCode() === 200) {
      $body = str_replace(['___PAGE_TYPE___', '___PAGE_ID___'], [$type ?: '', $id ?: ''], $response->getBody()->getContents());
      return new Response($body, $statusCode, $this->cacheHeaders);
    }
    elseif (
      $response->getStatusCode() === 401 &&
      $this->cdnAuthParams
    ) {
      $response = $this->client->request('POST', $location, $this->cdnAuthParams);
      if ($response->getStatusCode() === 200) {
        $body = str_replace(['___PAGE_TYPE___', '___PAGE_ID___'], [$type ?: '', $id ?: ''], $response->getBody()->getContents());
        return new Response($body, $statusCode, $this->cacheHeaders);
      }
    }
  }
}
