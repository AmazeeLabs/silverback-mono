<?php

namespace Drupal\silverback_cdn_redirect\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\silverback_cdn_redirect\EventSubscriber\CdnRedirectRouteSubscriber;
use GuzzleHttp\Client;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


class CdnRedirectController extends ControllerBase {

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

    $request = Request::create($uri, 'GET', [], [], [], $request->server->all());
    $request->attributes->set('_silverback_cdn_redirect', TRUE);
    /** @var \Symfony\Component\HttpKernel\HttpKernelInterface $httpKernel */
    $httpKernel = \Drupal::service('http_kernel');
    $response = $httpKernel->handle($request);

    if ($response->isRedirection()) {
      $location = $response->headers->get('location');
      $parts = parse_url($location);
      $location = $baseUrl .
        ($parts['path'] ?? '') .
        (isset($parts['query']) ? "?{$parts['query']}" : '');
      $responseCode = $response->getStatusCode();
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
      $http = new Client([
        'http_errors' => FALSE,
        // We might need cookies if Netlify site is password protected.
        'cookies' => TRUE,
      ]);
      $response = $http->get($location);
      if ($response->getStatusCode() === 200) {
        return new Response($response->getBody(), 404, [
          'cache-control' => 'public, max-age=' . 60*60*24*30,
        ]);
      }
      elseif (
        $response->getStatusCode() === 401 &&
        ($password = $settings->get('netlify_password'))
      ) {
        $response = $http->post($location, [
          'form_params' => [
            'password' => $password,
          ],
        ]);
        if ($response->getStatusCode() === 200) {
          return new Response($response->getBody(), 404, [
            'cache-control' => 'public, max-age=' . 60*60*24*30,
          ]);
        }
      }
    }

    if ($location === $baseUrl . $uri) {
      return new Response('Circular redirect', 500);
    }

    $response = new TrustedRedirectResponse($location, $responseCode);
    // Vary the cache by the full URL. Otherwise it can happen that real backend
    // request /node/123 leads to frontend https://frontend.site/alias
    // because the redirect was already cached for /cdn-redirect/node/123
    // request.
    $response->getCacheableMetadata()->addCacheContexts(['url']);
    return $response;
  }
}
