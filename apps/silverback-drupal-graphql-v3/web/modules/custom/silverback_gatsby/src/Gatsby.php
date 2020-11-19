<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityPublishedInterface;
use Drupal\Core\Render\Markup;

class Gatsby {
  const PREVIEW_URL = 'http://localhost:8000/';
  const REFRESH_PREVIEW_URL = 'http://localhost:8000/__refresh';
  const SITE_URL = 'http://localhost:9000/';
  const REBUILD_SITE_URL = 'http://localhost:9001/__rebuild';

  const SUPPORTED_ENTITIES_BUNDLES = [
    'node' => [
      'page',
      'article',
    ],
  ];

  public static function onEntityOperation(EntityInterface $entity) {
    if (self::isEntitySupported($entity)) {
      self::refreshPreview();
      if (
        $entity instanceof EntityPublishedInterface &&
        (
          $entity->isPublished() || (
            !$entity->isPublished() &&
            isset($entity->original) &&
            $entity->original->isPublished()
          )
        )
      ) {
        self::rebuildSite();
      }
    }
  }

  public static function isEntitySupported(EntityInterface $entity) {
    return isset(self::SUPPORTED_ENTITIES_BUNDLES[$entity->getEntityTypeId()]) &&
      in_array($entity->bundle(), self::SUPPORTED_ENTITIES_BUNDLES[$entity->getEntityTypeId()]);
  }

  public static function refreshPreview() {
    try {
      \Drupal::httpClient()->post(self::REFRESH_PREVIEW_URL);
      \Drupal::messenger()->addMessage(Markup::create('Triggered a preview refreshed. It will update soon at <a href="' . self::PREVIEW_URL . '">' . self::PREVIEW_URL . '</a>.'));
    }
    catch (\Throwable $e) {
      \Drupal::messenger()->addError('Cannot trigger a refresh for preview.');
    }
  }

  public static function rebuildSite() {
    try {
      \Drupal::httpClient()->post(self::REBUILD_SITE_URL);
      \Drupal::messenger()->addMessage(Markup::create('Triggered a site rebuild. It will update soon at <a href="' . self::SITE_URL . '">' . self::SITE_URL . '</a>.'));
    }
    catch (\Throwable $e) {
      \Drupal::messenger()->addError('Cannot trigger a site rebuild.');
    }
  }
}
