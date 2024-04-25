<?php

namespace Drupal\silverback_autosave\EmptyAlter\Extension;

use Drupal\Core\Extension\ModuleHandler;

/**
 * Class that has an empty implementation of the hook-alter method.
 */
class ModuleHandlerEmptyAlter extends ModuleHandler {

  /**
   * {@inheritdoc}
   */
  public function __construct() {}

  /**
   * {@inheritdoc}
   */
  public function alter($type, &$data, &$context1 = NULL, &$context2 = NULL) {}

}
