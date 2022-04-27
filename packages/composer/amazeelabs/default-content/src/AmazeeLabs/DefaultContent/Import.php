<?php

namespace AmazeeLabs\DefaultContent;

use Drupal\Component\Utility\DiffArray;
use Drupal\Core\Serialization\Yaml;

abstract class Import extends Base {

  public static function run(string $module): void {
    /** @var \Drupal\default_content\ImporterInterface $importer */
    $importer = \Drupal::service('default_content.importer');
    $importer->importContent($module);
  }

  /**
   * Same as "run", but also updates the already imported content.
   *
   * It was introduced to solve the following problem:
   *   There is too much of the default content, the import takes too long.
   * How to solve it:
   *   - Put the default content into the Drupal install cache
   *   - Use this method instead of the "run" one
   */
  public static function runWithUpdate(string $module): void {
    $dir = self::getContentDir($module);
    /** @var \Drupal\default_content\ExporterInterface $exporter */
    $exporter = \Drupal::service('default_content.exporter');
    $stats = [
      'updated' => [],
      'removed' => [],
    ];

    $map = [];
    if (file_exists($dir) && is_dir($dir)) {
      foreach (scandir($dir) as $dirName) {
        if (
          $dirName !== '.' &&
          $dirName !== '..' &&
          is_dir($dir . DIRECTORY_SEPARATOR . $dirName) &&
          !is_link($dir . DIRECTORY_SEPARATOR . $dirName)
        ) {
          $entityType = $dirName;
          foreach (scandir($dir . DIRECTORY_SEPARATOR . $dirName) as $fileName) {
            if (
              $dirName !== '.' &&
              $dirName !== '..' &&
              is_file($dir . DIRECTORY_SEPARATOR . $dirName . DIRECTORY_SEPARATOR . $fileName) &&
              !is_link($dir . DIRECTORY_SEPARATOR . $dirName . DIRECTORY_SEPARATOR . $fileName)
            ) {
              [$uuid, $extension] = explode('.', $fileName);
              if ($extension === 'yml') {
                $map[$entityType][$uuid] = $dir . DIRECTORY_SEPARATOR . $dirName . DIRECTORY_SEPARATOR . $fileName;
              }
            }
          }
        }
      }
    }

    // Find entities which need an update.
    foreach ($map as $entityType => $data) {
      /** @var \Drupal\Core\Entity\EntityRepositoryInterface $entityRepository */
      $entityRepository = \Drupal::service('entity.repository');
      foreach ($data as $uuid => $path) {
        $entity = $entityRepository->loadEntityByUuid($entityType, $uuid);
        if ($entity) {
          $imported = $exporter->exportContentWithReferences($entityType, $entity->id());
          $imported = reset($imported);
          $imported = reset($imported);
          $exported = file_get_contents($path);
          if ($imported !== $exported) {
            $imported = Yaml::decode($imported);
            $exported = Yaml::decode($exported);
            if (
              DiffArray::diffAssocRecursive($imported, $exported) ||
              DiffArray::diffAssocRecursive($exported, $imported)
            ) {
              // Instead of messing with the entity update, we delete it.
              $entity->delete();
              if (!isset($stats['updated'][$entityType])) {
                $stats['updated'][$entityType] = 0;
              }
              $stats['updated'][$entityType]++;
            }
          }
        }
      }

      // Delete entities not existing in the exported content.
      $uuidKey = \Drupal::entityTypeManager()->getDefinition($entityType)->getKey('uuid') ?: 'uuid';
      $query = \Drupal::entityQuery($entityType)->condition($uuidKey, array_keys($data), 'NOT IN');
      if ($entityType === 'user') {
        $query->condition('uid', [0, 1], 'NOT IN');
      }
      $ids = $query->execute();
      if ($ids) {
        $storage = \Drupal::entityTypeManager()->getStorage($entityType);
        $storage->delete($storage->loadMultiple($ids));
        $stats['removed'][$entityType] = count($ids);
      }
    }

    echo "Default content update stats:\n";
    var_dump($stats);

    self::run($module);
  }

}
