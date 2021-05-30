<?php

namespace Drupal\silverback_gatsby\Plugin;

use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Core\Plugin\DefaultPluginManager;

/**
 * Class FeedPluginManager
 *
 * @package Drupal\silverback_gatsby\Plugin
 */
class FeedPluginManager extends DefaultPluginManager {

  protected function findDefinitions() {
    $definitions = parent::findDefinitions();

    // Attach the directive definition for each feed plugin so it is available
    // along with the plugin definition.
    foreach ($definitions as $id => $def) {
      $module = \Drupal::moduleHandler()->getModule($def['provider']);
      $path = 'graphql/' . $id . '.directive.graphqls';
      $file = $module->getPath() . '/' . $path;

      if (!file_exists($file)) {
        throw new InvalidPluginDefinitionException(
          $id,
          sprintf('The module "%s" needs to have a directive definition "%s" in its folder for "%s" to be valid.',
            $module->getName(), $path, $id));
      }

      $definitions[$id]['directive'] = file_get_contents($file);
    }

    return $definitions;
  }


}
