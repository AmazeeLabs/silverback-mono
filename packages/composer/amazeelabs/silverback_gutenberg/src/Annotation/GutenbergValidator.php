<?php

namespace Drupal\silverback_gutenberg\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * @Annotation
 */
class GutenbergValidator extends Plugin {

  /**
   * The validator plugin ID.
   *
   * @var string
   */
  public $id;

  /**
   * The human-readable name of the validator plugin.
   *
   * @ingroup plugin_translatable
   *
   * @var \Drupal\Core\Annotation\Translation
   */
  public $label;

  /**
   * The description of the validator plugin.
   *
   * @ingroup plugin_translatable
   *
   * @var \Drupal\Core\Annotation\Translation
   */
  public $description;

}
