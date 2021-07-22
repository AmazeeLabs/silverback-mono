<?php

namespace Drupal\silverback_gutenberg;

/**
 * Interface BlockMutatorInterface
 *
 * Used by BlockProcessor to manipulate parsed gutenberg blocks.
 *
 * @package Drupal\silverback_gutenberg
 */
interface BlockMutatorInterface {

  /**
   * @param array $block
   *   A parsed gutenberg block
   *
   * @return bool
   *   Indicates if the block should be processed by this mutator.
   */
  public function applies(array $block) : bool;

  /**
   * @param array &$block
   *   Reference to a parsed gutenberg block that can be modified in place.
   *
   * @return void
   */
  public function mutate(array &$block) : void;
}
