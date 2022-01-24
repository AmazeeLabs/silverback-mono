<?php

namespace AmazeeLabs\DefaultContent;

use Drupal\Core\Entity\ContentEntityType;

abstract class Export {

  public static function run(string $module, array $excludedContentEntityTypes): void {
    /** @var \Drupal\Core\Extension\ModuleExtensionList $extensionList */
    $extensionList = \Drupal::service('extension.list.module');
    $dir = DRUPAL_ROOT .
      DIRECTORY_SEPARATOR .
      $extensionList->getPath($module) .
      DIRECTORY_SEPARATOR .
      'content';
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
        $entityIds = \Drupal::entityQuery($entityTypeId)->execute();
        foreach ($entityIds as $entityId) {
          if ($entityTypeId === 'user' && ($entityId == 0 || $entityId == 1)) {
            // Users 0 and 1 are created automatically on Drupal installation.
            // Ignore them.
            continue;
          }
          $exporter->exportContentWithReferences($entityTypeId, $entityId, $dir);
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
