<?php

namespace Drupal\gatsby_build_monitor;

use Symfony\Component\HttpFoundation\Response;

class Controller {

  public function setState(string $state) {
    _gatsby_build_monitor_state($state);
    return Response::create();
  }

  public function getState() {
    return Response::create(_gatsby_build_monitor_state());
  }

}
