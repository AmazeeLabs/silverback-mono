<?php

namespace Drupal\silverback_gutenberg\BlockMutator;

/**
 * Interface for the block mutator plugin manager.
 */
interface BlockMutatorManagerInterface {

  /**
   * Mutates the gutenberg blocks before they are exported by the default
   * content module.
   *
   * @param array $blocks
   *  The gutenberg blocks being processed.
   * @param array $dependencies
   *  An array of dependencies for these blocks. Each key of the array should be
   *  a uuid and the value should be the corresponding entity type. Example:
   *  $dependencies['some-uuid'] = 'media';
   */
  public function mutateExport(array &$blocks, array &$dependencies): void;

  /**
   * Mutates the gutenberg blocks before they get imported.
   *
   * @param array $blocks
   *  The gutenberg blocks being processed.
   */
  public function mutateImport(array &$blocks): void;
}
