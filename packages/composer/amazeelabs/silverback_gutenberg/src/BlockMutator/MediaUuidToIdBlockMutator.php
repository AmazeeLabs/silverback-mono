<?php

namespace Drupal\silverback_gutenberg\BlockMutator;

use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\silverback_gutenberg\BlockMutatorInterface;

/**
 * Class MediaUuidToIdBlockMutator
 *
 * Replace referenced media entity uuid's with id's.
 *
 * @package Drupal\silverback_gutenberg\BlockMutator
 */
class MediaUuidToIdBlockMutator implements BlockMutatorInterface {

  /**
   * An entity repository to load entities from.
   *
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected EntityRepositoryInterface $repository;

  /**
   * MediaUuidToIdBlockMutator constructor.
   *
   * @param \Drupal\Core\Entity\EntityRepositoryInterface $repository
   */
  public function __construct(EntityRepositoryInterface $repository) {
    $this->repository = $repository;
  }

  /**
   * {@inheritDoc}
   */
  public function applies(array $block) : bool {
    return isset($block['attrs']['mediaEntityIds']);
  }

  /**
   * {@inheritDoc}
   */
  public function mutate(array &$block) : void {
    $block['attrs']['mediaEntityIds'] = array_map(
      function (string $uuid) {
        $entity = $this->repository->loadEntityByUuid('media', $uuid);
        return $entity->id();
      },
      $block['attrs']['mediaEntityIds']
    );
  }

}
