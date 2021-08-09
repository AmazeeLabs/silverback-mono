<?php

namespace Drupal\silverback_gutenberg\Plugin\DataType\Deriver;

use Drupal\Core\Plugin\Discovery\ContainerDeriverInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class GutenbergBlockDeriver implements ContainerDeriverInterface {
  protected array $derivatives;

  public static function create(ContainerInterface $container, $base_plugin_id) {
  }

  protected function getDerivatives() : array {
    if (!isset($this->derivatives)) {
      // TODO: Add actual derivatives.
      $this->derivatives = [
        [
          'id' => 'headline',
          'type' => 'custom/headline',
          'attributes' => ['level'],
        ]
      ];
    }
    return $this->derivatives;
  }

  public function getDerivativeDefinition($derivative_id, $base_plugin_definition) : array {
    return ($this->derivatives[$derivative_id] ?? []) + $base_plugin_definition;
  }

  public function getDerivativeDefinitions($base_plugin_definition) : array {
    $definitions = [];
    foreach ($this->derivatives as $info) {
      $definitions[] = $info + $base_plugin_definition;
    }
    return $definitions;
  }
}
