<?php

namespace Drupal\silverback_gutenberg;

/**
 * Class BlockProcessor
 *
 * Iterates through a tree of blocks and applies the assigned mutator.
 *
 * @package Drupal\silverback_gutenberg
 */
class BlockProcessor {

  /**
   * @var \Drupal\silverback_gutenberg\BlockMutatorInterface
   */
  protected BlockMutatorInterface $mutator;

  /**
   * BlockProcessor constructor.
   *
   * @param \Drupal\silverback_gutenberg\BlockMutatorInterface $mutator
   *   A mutator to be applied to all matching blocks.
   */
  public function __construct(BlockMutatorInterface $mutator) {
    $this->mutator = $mutator;
  }

  /**
   * Mutate the tree of blocks.
   *
   * @param array $blocks
   *   The result of BlockParser::parse()
   */
  public function mutate(array &$blocks) {
    foreach ($blocks as &$block) {
      if ($this->mutator->applies($block)) {
        $this->mutator->mutate($block);
      }
      $this->mutate($block['innerBlocks']);
    }
  }
}
