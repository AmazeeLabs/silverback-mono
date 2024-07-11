<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link;

use Drupal\Core\Entity\EntityInterface;

/**
 * Interface for relationships between preview links and entities they unlock.
 */
interface PreviewLinkHostInterface {

  /**
   * Get preview links for an entity.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   An entity.
   *
   * @return \Drupal\silverback_preview_link\Entity\SilverbackPreviewLinkInterface[]
   *   Preview links associated with an entity.
   */
  public function getPreviewLinks(EntityInterface $entity): array;

  /**
   * Determines if a token unlocks an entity.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   An entity.
   * @param string[] $tokens
   *   An array of Preview Link tokens.
   *
   * @return bool
   *   Whether if at least one provided token grants access to the entity.
   */
  public function isToken(EntityInterface $entity, array $tokens): bool;

  /**
   * Determines if an entity has any active preview links.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   An entity.
   *
   * @return bool
   *   Whether the entity has any associated preview links.
   */
  public function hasPreviewLinks(EntityInterface $entity): bool;

}
