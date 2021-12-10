<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\TranslatableInterface;

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
 *     "access" = @ContextDefinition("boolean",
 *       label = @Translation("Whether to do additional access check"),
 *       required = FALSE,
 *       default_value = TRUE,
 *     ),
 *   },
 * )
 */
class ListEntities extends EntityQueryBase {

  public function resolve(string $type, ?string $bundle, ?int $offset, ?int $limit, $access, RefinableCacheableDependencyInterface $metadata) {
    $storage = \Drupal::entityTypeManager()->getStorage($type);
    $entityType = $storage->getEntityType();
    $query = $this->getQuery($type, $metadata);

    if ($bundle) {
      $query->condition($entityType->getKey('bundle'), $bundle);
    }
    $query->range($offset, $limit);

    $ids = $query->execute();
    $entities = !empty($ids) ? $storage->loadMultiple($ids) : [];

    $metadata->addCacheTags($entityType->getListCacheTags());
    $metadata->addCacheContexts($entityType->getListCacheContexts());

    $entities = $access
      ? array_map(
      function (EntityInterface $entity) {
        $result = null;
        if ($entity->access('view')) {
          $result = $entity;
        }
        else if ($entity instanceof TranslatableInterface && $entity->isTranslatable()) {
          foreach ($entity->getTranslationLanguages(false) as $lang) {
            $translation = $entity->getTranslation($lang->getId());
            if ($translation->access('view')) {
              $result = $translation;
              break;
            }
          }
        }
        return $result;
      },
      $entities
    ) : $entities;

    foreach (array_filter($entities) as $entity) {
      $metadata->addCacheableDependency($entity);
    }

    return $entities;
  }

}
