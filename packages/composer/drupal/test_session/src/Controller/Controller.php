<?php

namespace Drupal\test_session\Controller;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class Controller extends ControllerBase {

  public function set(Request $request) {
    if (!test_session_enabled() || !($request->isMethod('POST') || $request->isMethod('GET'))) {
      throw new NotFoundHttpException();
    }
    $session = $request->getSession();
    foreach (['USER', 'LANGUAGE', 'WORKSPACE', 'TOOLBAR'] as $key) {
      if ($request->headers->has('X-TEST-SESSION-' . $key)) {
        $session->set('TEST_SESSION_' . $key, $request->headers->get('X-TEST-SESSION-' . $key));
      }
      if (($value = $request->get('X-TEST-SESSION-' . $key)) !== NULL) {
        $session->set('TEST_SESSION_' . $key, $value);
      }
    }
    Cache::invalidateTags(['test_session']);
    return new Response();
  }

  public function clear(Request $request) {
    if (!test_session_enabled() || !($request->isMethod('POST') || $request->isMethod('GET'))) {
      throw new NotFoundHttpException();
    }
    $session = $request->getSession();
    foreach (['USER', 'LANGUAGE', 'WORKSPACE', 'TOOLBAR'] as $key) {
      $session->remove('TEST_SESSION_' . $key);
    }
    Cache::invalidateTags(['test_session']);
    return new Response();
  }

}
