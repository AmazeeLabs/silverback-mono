<?php

namespace AmazeeLabs\DefaultContent;

use Drupal\Component\Utility\DiffArray;
use Drupal\Component\Utility\Variable;
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
    /** @var \Drupal\default_content\Normalizer\ContentEntityNormalizerInterface $normalizer */
    $normalizer = \Drupal::service('default_content.content_entity_normalizer');
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

    // First run the import so missing entities are created.
    self::run($module);

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
            $diff1 = DiffArray::diffAssocRecursive($imported, $exported)['default'] ?? [];
            $diff2 = DiffArray::diffAssocRecursive($exported, $imported)['default'] ?? [];
            if ($diff1 || $diff2) {
              $fields = array_unique(array_merge(array_keys($diff1), array_keys($diff2)));

              if ($entityType === 'user') {
                // This one changes frequently, but affects nothing.
                $index = array_search('access', $fields, TRUE);
                if ($index !== FALSE) {
                  unset($fields[$index]);
                }
                // This one is updated during the export.
                $index = array_search('pass', $fields, TRUE);
                if ($index !== FALSE && isset($diff1['pass'][0]['pre_hashed']) && count($diff1['pass'][0]) === 1) {
                  unset($fields[$index]);
                }
                // Maybe we don't need the update now.
                if (empty($fields)) {
                  continue;
                }
              }

              $exportedEntity = $normalizer->denormalize($exported);
              foreach ($fields as $field) {
                if ($exportedEntity->get($field)->isEmpty()) {
                  $entity->get($field)->delete();
                }
                else {
                  $entity->get($field)->setValue($exportedEntity->get($field)->getValue());
                }
              }
              $entity->save();
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
    echo Variable::export($stats) . "\n";
  }

}
