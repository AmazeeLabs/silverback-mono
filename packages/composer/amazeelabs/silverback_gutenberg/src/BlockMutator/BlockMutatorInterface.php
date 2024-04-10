<?php

namespace Drupal\silverback_gutenberg\BlockMutator;

/**
 * Interface for block mutator plugins.
 */
interface BlockMutatorInterface {

  /**
   * Checks if the $block sent as parameter should be mutated.
   *
   * @param array $block
   *  The gutenberg block being processed.
   * @return bool
   */
  public function applies(array $block): bool;

  /**
   * Mutates the gutenberg block before it is exported by the default content
   * module.
   *
   * @param array $block
   *  The gutenberg block being processed. The changes should be done directly
   *  on the block.
   * @param array $dependencies
   *  An array of dependencies for this block. Each key of the array should be
   *  a uuid and the value should be the corresponding entity type. Example:
   *  $dependencies['some-uuid'] = 'media';
   */
  public function mutateExport(array &$block, array &$dependencies): void;

  /**
   * Mutates the gutenberg block before it gets imported.
   *
   * @param array $block
   *  The gutenberg block being processed. The changes should be done directly
   *  on the block.
   */
  public function mutateImport(array &$block): void;
}
