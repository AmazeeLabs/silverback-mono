<?php

namespace Drupal\gatsby_build_monitor;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class Controller {

  public function setState(Request $request) {
    $token = \Drupal::config('gatsby_build_monitor.settings')->get('token');
    if (!$token) {
      return Response::create('Token is not configured', 503);
    }
    if ($request->headers->get('token') !== $token) {
      return Response::create('Token is not valid', 401);
    }

    $content = $request->getContent();
    if (is_string($content)) {
      $payload = json_decode($content, TRUE);
      if (
        is_array($payload) &&
        isset($payload['process']) &&
        $payload['process'] === 'build' &&
        isset($payload['status']) &&
        in_array($payload['status'], ['building', 'idle'], TRUE)
      ) {
        _gatsby_build_monitor_state($payload['status']);
        return Response::create('', 200);
      }
    }

    return Response::create('', 400);
  }

  public function getState() {
    return Response::create(_gatsby_build_monitor_state());
  }

}
