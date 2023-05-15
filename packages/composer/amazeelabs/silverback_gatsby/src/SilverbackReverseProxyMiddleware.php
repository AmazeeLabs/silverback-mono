<?php

namespace Drupal\silverback_gatsby;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Custom reverse proxy middleweare.
 * 
 * Rewrites custom reverse proxy headers to standard ones.
 * Lagoon won't allow X-Forwarded-* headers from unknown proxies
 * and Netlify does not provide an IP range. Therefore we send
 * custom SLB-Forwarded-* headers and write them into X-Forwarded-*
 * using this middleware.
 */
class SilverbackReverseProxyMiddleware implements HttpKernelInterface {

  /**
   * The inner kernel to which the request will be passed.
   *
   * @var \Symfony\Component\HttpKernel\HttpKernelInterface
   */
  protected $app;

  /**
   * Constructs a HostChanger object.
   *
   * @param \Symfony\Component\HttpKernel\HttpKernelInterface $app
   *   The inner kernel to which the request will be passed.
   */
  public function __construct(HttpKernelInterface $app) {
    $this->app = $app;
  }

  /**
   * {@inheritDoc}
   */
  public function handle(Request $request, $type = HttpKernelInterface::MASTER_REQUEST, $catch = TRUE): Response {
    foreach (['Proto', 'Host', 'Port', 'For'] as $header) {
      if ($request->headers->has('SLB-Forwarded-' . $header)) {
        $request->headers->set('X-Forwarded-' . $header, $request->headers->get('SLB-Forwarded-' . $header));
      }
    }
    // Pass the request to the next middleware.
    return $this->app->handle($request, $type, $catch);
  }
}