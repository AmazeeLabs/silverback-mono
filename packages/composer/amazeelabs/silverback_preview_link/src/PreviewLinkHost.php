<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Service for relationships between preview links and entities they unlock.
 */
class PreviewLinkHost implements PreviewLinkHostInterface {

  protected PreviewLinkStorageInterface $previewLinkStorage;

  /**
   * PreviewLinkHost constructor.
   */
  final public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    protected TimeInterface $time,
  ) {
    /** @var \Drupal\silverback_preview_link\PreviewLinkStorageInterface $storage */
    $storage = $entityTypeManager->getStorage('silverback_preview_link');
    $this->previewLinkStorage = $storage;
  }

  /**
   * {@inheritdoc}
   */
  public function getPreviewLinks(EntityInterface $entity): array {
    $ids = $this->previewLinkStorage->getQuery()
      ->accessCheck()
      ->condition('entities.target_type', $entity->getEntityTypeId())
      ->condition('entities.target_id', $entity->id())
      ->execute();
    return $this->previewLinkStorage->loadMultiple($ids);
  }

  /**
   * {@inheritdoc}
   */
  public function isToken(EntityInterface $entity, array $tokens): bool {
    $count = $this->previewLinkStorage->getQuery()
      ->accessCheck()
      ->condition('entities.target_type', $entity->getEntityTypeId())
      ->condition('entities.target_id', $entity->id())
      ->condition('token', $tokens, 'IN')
      ->count()
      ->execute();
    return $count > 0;
  }

  /**
   * {@inheritdoc}
   */
  public function hasPreviewLinks(EntityInterface $entity): bool {
    $count = $this->previewLinkStorage->getQuery()
      ->accessCheck()
      ->condition('entities.target_type', $entity->getEntityTypeId())
      ->condition('entities.target_id', $entity->id())
      ->condition('expiry', $this->time->getRequestTime(), '>')
      ->count()
      ->execute();
    return $count > 0;
  }

}
