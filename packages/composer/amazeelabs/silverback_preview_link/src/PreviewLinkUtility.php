<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link;

use Drupal\Core\Entity\EntityTypeInterface;

/**
 * Preview link utility.
 */
class PreviewLinkUtility {

  /**
   * Determines if an entity type is supported by Preview Link.
   *
   * @param \Drupal\Core\Entity\EntityTypeInterface $entityType
   *   An entity type.
   *
   * @return bool
   *   Whether an entity type is supported by Preview Link.
   */
  public static function isEntityTypeSupported(EntityTypeInterface $entityType): bool {
    return $entityType->isRevisionable() && $entityType->hasLinkTemplate('canonical');
  }

}
