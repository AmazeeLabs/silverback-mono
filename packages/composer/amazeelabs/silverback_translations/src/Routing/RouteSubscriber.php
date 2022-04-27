<?php

namespace Drupal\silverback_translations\Routing;

use Drupal\Core\Authentication\AuthenticationCollectorInterface;
use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Route subscriber.
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * @var Drupal\Core\Authentication\AuthenticationCollectorInterface
   *
   * The authentication collector service.
   */
  protected $authenticationCollector;

  public function __construct(AuthenticationCollectorInterface $authentication_collector) {
    $this->authenticationCollector = $authentication_collector;
  }

  /**
   * {@inheritDoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    // Unfortunately, there is no way right now to allow all the authentication
    // providers for a specific route, so we need to explicitly set them in
    // the route options itself. When https://www.drupal.org/project/drupal/issues/3200620
    // will get in, we can just remove this code and set the _auth option in
    // the routing yml file.
    if ($route = $collection->get('silverback_translations.create_sources')) {
      $auth = array_keys($this->authenticationCollector->getSortedProviders());
      $options['_auth'] = $auth;
      $route->addOptions($options);
    }
  }
}
