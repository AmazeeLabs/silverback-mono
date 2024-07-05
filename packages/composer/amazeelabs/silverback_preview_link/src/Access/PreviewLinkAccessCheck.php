<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Access\AccessResultInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\silverback_preview_link\PreviewLinkHostInterface;

/**
 * Preview link access check.
 */
class PreviewLinkAccessCheck implements AccessInterface {

  /**
   * PreviewLinkAccessCheck constructor.
   */
  public function __construct(
    protected PreviewLinkHostInterface $previewLinkHost,
  ) {
  }

  /**
   * Checks access to the preview link.
   */
  public function access(EntityInterface $entity = NULL, string $preview_token = NULL): AccessResultInterface {
    $neutral = AccessResult::neutral()->addCacheableDependency($entity);
    if (!$preview_token || !$entity) {
      return $neutral;
    }

    // If we can't find a valid preview link then ignore this.
    if (!$this->previewLinkHost->hasPreviewLinks($entity)) {
      return $neutral->setReason('This entity does not have a preview link.');
    }

    // If an entity has a preview link that doesn't match up,
    // then explicitly deny access.
    if (!$this->previewLinkHost->isToken($entity, [$preview_token])) {
      return AccessResult::forbidden('Preview token is invalid.')->addCacheableDependency($entity);
    }

    return AccessResult::allowed()->addCacheableDependency($entity);
  }

}
