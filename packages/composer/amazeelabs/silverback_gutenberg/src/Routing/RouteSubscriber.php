<?php

namespace Drupal\silverback_gutenberg\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Drupal\silverback_gutenberg\Controller\LinkitAutocomplete;
use Symfony\Component\Routing\RouteCollection;

class RouteSubscriber extends RouteSubscriberBase {

  protected function alterRoutes(RouteCollection $collection) {
    if ($route = $collection->get('gutenberg.content.search')) {
      $route->setDefault('_controller', LinkitAutocomplete::class . '::search');
    }
  }

}
