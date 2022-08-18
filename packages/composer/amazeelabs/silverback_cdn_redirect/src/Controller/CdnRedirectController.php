<?php

namespace Drupal\silverback_cdn_redirect\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\silverback_cdn_redirect\EventSubscriber\CdnRedirectRouteSubscriber;
use GuzzleHttp\Client;
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
   * Creates a CdnRedirectController object.
   */
  public function __construct(UrlGeneratorInterface $url_generator, ClientInterface $client) {
    $this->urlGenerator = $url_generator;
    $this->client = $client;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('url_generator'),
      $container->get('silverback_cdn_redirect.http_client'),
    );
  }

  public function handle(string $path, Request $request) {
    $settings = \Drupal::config('silverback_cdn_redirect.settings');
    $baseUrl = $settings->get('base_url');
    $notFoundPath = $settings->get('404_path');
    if (!$baseUrl || !$notFoundPath) {
      return new Response('The module is not configured', 500);
    }

    $cacheHeaders = [
      // Five minutes cache for 404 and redirect responses.
      'cache-control' => 'public, max-age=' . 60*5,
    ];

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

      // Desired behavior: fetch the 404 page and return its contents.
      $response = $this->client->request('GET', $location);
      if ($response->getStatusCode() === 200) {
        return new Response($response->getBody(), 404, $cacheHeaders);
      }
      elseif (
        $response->getStatusCode() === 401 &&
        ($password = $settings->get('netlify_password'))
      ) {
        $response = $this->client->request('POST', $location, [
          'form_params' => [
            'password' => $password,
          ],
        ]);
        if ($response->getStatusCode() === 200) {
          return new Response($response->getBody(), 404, $cacheHeaders);
        }
      }
    }

    if ($location === $baseUrl . $uri) {
      return new Response('Circular redirect', 500);
    }

    $response = new TrustedRedirectResponse($location, $responseCode, $cacheHeaders);
    // Vary the cache by the full URL. Otherwise, it can happen that
    // "backend.site/node/123" will lead to "frontend.site/node-alias" because
    // the redirect was already cached for "backend.site/cdn-redirect/node/123".
    $response->getCacheableMetadata()->addCacheContexts(['url']);
    return $response;
  }
}
