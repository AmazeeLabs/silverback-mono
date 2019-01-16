<?php

namespace Drupal\webform_jsonschema\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Event subscriber.
 */
class EventSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    foreach ($collection as $name => $route) {
      if (
        $route->getPath() === '/webform_jsonschema/{webform_id}' &&
        ($requirements = $route->getRequirements()) &&
        isset($requirements['_content_type_format'])
      ) {
        // Set content type to JSON on routes to make Drupal happy.
        $route->setRequirement('_content_type_format', 'json');
      }
    }
  }

}
