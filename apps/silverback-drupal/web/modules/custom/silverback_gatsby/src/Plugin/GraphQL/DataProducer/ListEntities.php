<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;

/**
 * @DataProducer(
 *   id = "list_entities",
 *   name = @Translation("List entities"),
 *   produces = @ContextDefinition("entity",
 *     label = @Translation("Entities"),
 *     multiple = TRUE,
 *   ),
 *   consumes = {
 *     "type" = @ContextDefinition("string",
 *       label = @Translation("Entity type"),
 *       required = TRUE,
 *     ),
 *     "bundle" = @ContextDefinition("string",
 *       label = @Translation("Bundle"),
 *       required = FALSE,
 *     ),
 *     "offset" = @ContextDefinition("integer",
 *       label = @Translation("Offset"),
 *       required = FALSE,
 *     ),
 *     "limit" = @ContextDefinition("integer",
 *       label = @Translation("Limit"),
 *       required = FALSE,
 *     ),
 *   },
 * )
 */
class ListEntities extends EntityQueryBase {

  public function resolve(string $type, ?string $bundle, ?int $offset, ?int $limit, RefinableCacheableDependencyInterface $metadata) {
    $storage = \Drupal::entityTypeManager()->getStorage($type);
    $entityType = $storage->getEntityType();
    $query = $this->getQuery($type);

    if ($bundle) {
      $query->condition($entityType->getKey('bundle'), $bundle);
    }
    $query->range($offset, $limit);

    $ids = $query->execute();
    $entities = !empty($ids) ? $storage->loadMultiple($ids) : [];

    $metadata->addCacheTags($entityType->getListCacheTags());
    $metadata->addCacheContexts($entityType->getListCacheContexts());
    foreach ($entities as $entity) {
      $metadata->addCacheableDependency($entity);
    }

    $this->checkAccess($entities);

    return $entities;
  }

}
