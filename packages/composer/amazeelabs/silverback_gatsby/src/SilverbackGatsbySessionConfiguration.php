<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Session\SessionConfiguration;
use Symfony\Component\HttpFoundation\Request;

/**
 * Decorator for the core session configuration service.
 */
class SilverbackGatsbySessionConfiguration extends SessionConfiguration {
  /**
   * Remove X-Forwarded-* headers from the request, so they
   * don't affect the session name. Otherwise session information
   * is lost when using a reverse proxy and direct access simultaneously.
   * 
   * Use case: User login-in via the backend domain and send requests from
   * the frontend that include X-Forwarded-* headers to create image urls
   * with the frontend domain. Without this, the dynamic request would not
   * be authenticated any more because the session name would be different,
   * because `$request->getHost()` would return the X-Forwarded-Host.
   */
  protected function getUnprefixedName(Request $request) {
    $cleaned = clone $request;
    $cleaned->headers->remove('X-Forwarded-Proto');
    $cleaned->headers->remove('X-Forwarded-Host');
    $cleaned->headers->remove('X-Forwarded-Port');
    return parent::getUnprefixedName($cleaned);
  }
}