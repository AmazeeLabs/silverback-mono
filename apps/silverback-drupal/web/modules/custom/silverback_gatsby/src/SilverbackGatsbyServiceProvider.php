<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

class SilverbackGatsbyServiceProvider extends ServiceProviderBase {

  public function alter(ContainerBuilder $container) {
    $entityFeeds = $container->getParameter('silverback_gatsby.entity_feeds') ?: [];
    foreach($entityFeeds as $entityFeed) {
      $id = 'silverback_gatsby.feed.' . $entityFeed['type'] . '.' . $entityFeed['bundle'];
      $def = $container->register($id, EntityFeed::class);
      $def->addArgument($entityFeed['type']);
      $def->addArgument($entityFeed['bundle']);
      $def->addArgument($entityFeed['typeName']);
      $def->addArgument($entityFeed['translatable']);
      $def->addArgument($entityFeed['diffable']);
      $def->addTag('silverback_gatsby_feed');
    }
  }

}
