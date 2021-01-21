<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;

/**
 * @DataProducer(
 *   id = "entity_changes",
 *   name = @Translation("Entity changes"),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("List of entity changes"),
 *     multiple = TRUE,
 *   ),
 *   consumes = {
 *     "type" = @ContextDefinition("string",
 *       label = @Translation("Entity type"),
 *       required = TRUE,
 *     ),
 *     "bundle" = @ContextDefinition("string",
 *       label = @Translation("Bundle"),
 *       required = TRUE,
 *     ),
 *     "since" = @ContextDefinition("integer",
 *       label = @Translation("Timestamp"),
 *       required = TRUE,
 *     ),
 *     "ids" = @ContextDefinition("integer",
 *       label = @Translation("IDs"),
 *       multiple = TRUE,
 *       required = FALSE,
 *     ),
 *   },
 * )
 */
class EntityChanges extends EntityQueryBase {

  public function resolve(string $type, string $bundle, int $since, array $ids, RefinableCacheableDependencyInterface $metadata) {
    $entityType = \Drupal::entityTypeManager()->getDefinition($type);

    // Update.
    $query = $this->getQuery($type);
    $query->condition($entityType->getKey('bundle'), $bundle);
    $query->condition('changed', $since, '>');
    $changedIds = $query->execute();
    $result = array_map(
      fn($id) => ['type' => 'Update', 'id' => $id],
      $changedIds
    );

    // Delete.
    if (!empty($ids)) {
      $query = $this->getQuery($type);
      $query->condition($entityType->getKey('bundle'), $bundle);
      $query->condition($entityType->getKey('id'), $ids, 'IN');
      $existingIds = $query->execute();
      $missingIds = array_diff($ids, $existingIds);
      $result = array_merge($result, array_map(
        fn($id) => ['type' => 'Delete', 'id' => $id],
        $missingIds
      ));
    }

    $metadata->addCacheTags($entityType->getListCacheTags());
    $metadata->addCacheContexts($entityType->getListCacheContexts());

    return $result;
  }

}
