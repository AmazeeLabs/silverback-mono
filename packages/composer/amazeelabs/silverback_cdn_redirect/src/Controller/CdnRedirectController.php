<?php

namespace Drupal\silverback_cdn_redirect\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\silverback_cdn_redirect\EventSubscriber\CdnRedirectRouteSubscriber;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


class CdnRedirectController extends ControllerBase {

  public function handle(string $path, Request $request) {
    $baseUrl = \Drupal::config('silverback_cdn_redirect.settings')->get('base_url');
    $fallback = \Drupal::config('silverback_cdn_redirect.settings')->get('fallback_path');
    if (!$baseUrl || !$fallback) {
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
        \Drupal::config('silverback_cdn_redirect.settings')->get('prefix_fallback_path') &&
        CdnRedirectRouteSubscriber::$currentLangcode &&
        ($prefixes = \Drupal::config('language.negotiation')->get('url.prefixes')) &&
        ($prefix = $prefixes[CdnRedirectRouteSubscriber::$currentLangcode])
      )
        ? '/' . $prefix
        : '';
      $location = $baseUrl . $prefix . $fallback;
      $responseCode = 302;
    }

    if ($location === $baseUrl . $uri) {
      return new Response('Circular redirect', 500);
    }

    return new TrustedRedirectResponse($location, $responseCode);
  }
}
