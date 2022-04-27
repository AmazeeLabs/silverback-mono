<?php

namespace AmazeeLabs\DefaultContent;

use Drupal\Core\Entity\ContentEntityType;

abstract class Export extends Base {

  public static function run(string $module, array $excludedContentEntityTypes): void {
    $dir = self::getContentDir($module);
    self::rrmdir($dir);
    /** @var \Drupal\default_content\ExporterInterface $exporter */
    $exporter = \Drupal::service('default_content.exporter');
    $entity_type_definitions = \Drupal::entityTypeManager()->getDefinitions();
    foreach ($entity_type_definitions as $definition) {
      $entityTypeId = $definition->id();
      if (
        $definition instanceof ContentEntityType &&
        !in_array($entityTypeId, $excludedContentEntityTypes, TRUE)
      ) {
        $entityIds = \Drupal::entityQuery($entityTypeId)
          // Disable access checks to prevent modules (like
          // https://www.drupal.org/project/domain_entity) to hide some entities
          // from the export.
          ->accessCheck(FALSE)
          ->execute();
        foreach ($entityIds as $entityId) {
          if ($entityTypeId === 'user' && ($entityId == 0 || $entityId == 1)) {
            // Users 0 and 1 are created automatically on Drupal installation.
            // Ignore them.
            continue;
          }
          $exporter->exportContentWithReferences($entityTypeId, $entityId, $dir);
        }
        if ($entityTypeId === 'user') {
          $userDir = $dir . DIRECTORY_SEPARATOR . 'user';
          if (is_dir($userDir)) {
            foreach (scandir($userDir) as $fileName) {
              $filePath = $userDir . DIRECTORY_SEPARATOR . $fileName;
              if (is_file($filePath)) {
                # Fix passwords.
                # https://www.drupal.org/project/default_content/issues/2943458#comment-14022041
                file_put_contents($filePath, str_replace(
                  'pre_hashed: false',
                  'pre_hashed: true',
                  file_get_contents($filePath)
                ));
              }
            }
          }
        }
      }
    }
  }

  // From https://stackoverflow.com/a/3338133/580371
  protected static function rrmdir(string $dir) {
    if (is_dir($dir)) {
      $objects = scandir($dir);
      foreach ($objects as $object) {
        if ($object !== '.' && $object !== '..') {
          if (
            is_dir($dir . DIRECTORY_SEPARATOR . $object) &&
            !is_link($dir . DIRECTORY_SEPARATOR . $object)
          ) {
            self::rrmdir($dir . DIRECTORY_SEPARATOR . $object);
          }
          else {
            unlink($dir . DIRECTORY_SEPARATOR . $object);
          }
        }
      }
      rmdir($dir);
    }
  }

}
