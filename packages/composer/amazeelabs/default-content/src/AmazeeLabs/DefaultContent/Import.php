<?php

namespace AmazeeLabs\DefaultContent;

abstract class Import {

  public static function run(string $module): void {
    /** @var \Drupal\default_content\ImporterInterface $importer */
    $importer = \Drupal::service('default_content.importer');
    $importer->importContent($module);
  }

}
