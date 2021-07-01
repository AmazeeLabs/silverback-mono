<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Entity\Query\QueryInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

class EntityQueryBase extends DataProducerPluginBase {

  protected function getQuery(string $type, RefinableCacheableDependencyInterface $metadata): QueryInterface {
    $currentUser = \Drupal::currentUser();
    $entityType = \Drupal::entityTypeManager()->getDefinition($type);

    $query = \Drupal::entityQuery($type)
      ->currentRevision()
      ->accessCheck();

    // Add access conditions. Because accessCheck() does nothing by default. For
    // example it does not filter out unpublished nodes for anonymous users.
    // Special permission for nodes.
    if ($type === 'node' && !$currentUser->hasPermission('bypass node access')) {
      $query->condition('status', 1);
    }
    // Admin permission for other entity types.
    if (
      ($publishedKey = $entityType->getKey('published')) &&
      ($adminPermission = $entityType->getAdminPermission()) &&
      !$currentUser->hasPermission($adminPermission)
    ) {
      $query->condition($publishedKey, 1);
    }

    $metadata->addCacheTags($entityType->getListCacheTags());
    $metadata->addCacheContexts($entityType->getListCacheContexts());

    return $query;
  }

}
