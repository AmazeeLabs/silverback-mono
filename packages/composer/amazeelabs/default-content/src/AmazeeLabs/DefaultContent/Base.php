<?php

namespace AmazeeLabs\DefaultContent;

abstract class Base {

  public static function getContentDir(string $module): string {
    /** @var \Drupal\Core\Extension\ModuleExtensionList $extensionList */
    $extensionList = \Drupal::service('extension.list.module');
    return DRUPAL_ROOT .
      DIRECTORY_SEPARATOR .
      $extensionList->getPath($module) .
      DIRECTORY_SEPARATOR .
      'content';
  }

}
