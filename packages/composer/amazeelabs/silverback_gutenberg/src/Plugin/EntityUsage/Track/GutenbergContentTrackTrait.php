<?php

namespace Drupal\silverback_gutenberg\Plugin\EntityUsage\Track;

use Drupal\Core\Entity\EntityStorageException;

trait GutenbergContentTrackTrait {

  /**
   * Converts an array of references obtained using the extractor services to an
   * entity usage list representation.
   *
   * The array of references looks like this:
   * array(
   *   'node' => array(
   *      'uuid_1' => 'uuid_1',
   *      'uuid_2' => 'uuid_2',
   *   ),
   *   'user' => array(
   *      'uuid_user_1' => 'uuid_user_1',
   *      'uuid_user_2' => 'uuid_user_2',
   *   )
   * ).
   * The entity usage list representation would be:
   * array(
   *   'node|nid1',
   *   'node|nid2',
   *   'user|uid1',
   *   'user|uid2'
   * )
   * @param $references
   * @return array
   */
  protected function convertReferencesToEntityUsageList($references) {
    $targetEntities = [];
    foreach ($references as $entityType => $uuids) {
      foreach ($uuids as $uuid) {
        try {
          $entity = $this->entityRepository->loadEntityByUuid($entityType, $uuid);
          if (!$entity) {
            continue;
          }
          $targetEntities[] = implode('|', [$entityType, $entity->id()]);
        } catch (EntityStorageException $e) {
          // Just ignore this exception.
        }
      }
    }
    return $targetEntities;
  }
}
