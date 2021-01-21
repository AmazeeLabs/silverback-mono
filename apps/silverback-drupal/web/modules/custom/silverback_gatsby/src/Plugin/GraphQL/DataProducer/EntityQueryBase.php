<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\Query\QueryInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

class EntityQueryBase extends DataProducerPluginBase {

  protected function getQuery(string $type): QueryInterface {
    $query = \Drupal::entityQuery($type)
      ->currentRevision()
      ->accessCheck();

    // Add access conditions. Because accessCheck() does nothing by default. For
    // example it does not filter out unpublished nodes for anonymous users.
    if ($type === 'node' && !\Drupal::currentUser()->hasPermission('bypass node access')) {
      $query->condition('status', 1);
    }

    return $query;
  }

  protected function checkAccess(array $entities): void {
    /** @var \Drupal\Core\Entity\EntityInterface $entity */
    foreach ($entities as $entity) {
      if (!$entity->access('view')) {
        $account = \Drupal::currentUser();
        throw new \Exception("Entity query returned an entity which cannot be accessed by the current user. Looks like some query condition is missing above. User ID: '{$account->id()}', entity type: '{$entity->getEntityTypeId()}', entity ID: '{$entity->id()}'.");
      }
    }
  }

}
