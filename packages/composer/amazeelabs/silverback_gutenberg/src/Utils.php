<?php

namespace Drupal\silverback_gutenberg;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\gutenberg\Controller\UtilsController;

class Utils {

  public static function getGutenbergFields(EntityInterface $entity): array {
    if (!function_exists('_gutenberg_is_gutenberg_enabled') || !_gutenberg_is_gutenberg_enabled($entity)) {
      return [];
    }
    if ($entity instanceof FieldableEntityInterface) {
      $textFields = UtilsController::getEntityTextFields($entity);
      if (empty($textFields)) {
        return [];
      }
      // At the moment Gutenberg uses the first text field.
      return [$textFields[0]];
    }
    return [];
  }

  public static function linkProcessor(): LinkProcessor {
    return \Drupal::service(LinkProcessor::class);
  }

}
