<?php

namespace Drupal\silverback_gutenberg\BlockMutator;

use Drupal\Core\Plugin\PluginBase;

/**
 * Base class for the block mutator plugins. This does basically nothing on
 * import / export, but it can be used by mutator classes that provide only one
 * operation (import or export).
 */
abstract class BlockMutatorBase extends PluginBase implements BlockMutatorInterface {

  /**
   * {@inheritDoc}
   */
  public function mutateExport(array &$block, array &$dependencies): void {}

  /**
   * {@inheritDoc}
   */
  public function mutateImport(array &$block): void {}

}
