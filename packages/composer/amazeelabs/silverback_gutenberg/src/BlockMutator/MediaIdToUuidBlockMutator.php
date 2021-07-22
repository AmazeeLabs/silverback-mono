<?php

namespace Drupal\silverback_gutenberg\BlockMutator;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\silverback_gutenberg\BlockMutatorInterface;

/**
 * Class MediaIdToUuidBlockMutator
 *
 * Replace referenced media entity id's with uuids.
 *
 * @package Drupal\silverback_gutenberg\BlockMutator
 */
class MediaIdToUuidBlockMutator implements BlockMutatorInterface {

  /**
   * An entity repository to load entities from.
   *
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected EntityRepositoryInterface $repository;

  /**
   * MediaIdToUuidBlockMutator constructor.
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
    $block['attrs']['mediaEntityIds'] = array_values(array_map(
      fn (ContentEntityInterface $entity) => $entity->uuid(),
      $this->repository
        ->getCanonicalMultiple('media', $block['attrs']['mediaEntityIds'])
    ));
  }

}
