<?php

namespace Drupal\silverback_gutenberg\TypedData;

use Drupal\Core\TypedData\ComplexDataDefinitionBase;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\Core\TypedData\ListDataDefinition;

class GutenbergBlockDefinition extends ComplexDataDefinitionBase {

  public static function create($type) {
    return new static(['type' => $type]);
  }

  public function getPropertyDefinitions() {
    if (!isset($this->propertyDefinitions)) {
      $this->propertyDefinitions['__type'] = DataDefinition::create('string')->setRequired(true);
      $this->propertyDefinitions['__html'] = DataDefinition::create('string')->setRequired(false);
      $this->propertyDefinitions['__children'] = ListDataDefinition::create('gutenberg_block')->setRequired(false);

      // TODO: create attribute properties for all attributes of this block.
    }
    return $this->propertyDefinitions;
  }

}
