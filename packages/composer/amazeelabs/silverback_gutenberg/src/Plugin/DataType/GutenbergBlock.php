<?php

namespace Drupal\silverback_gutenberg\Plugin\DataType;

use Drupal\Core\TypedData\Plugin\DataType\Map;
use Drupal\silverback_gutenberg\TypedData\GutenbergBlockDefinition;

/**
 * @DataType(
 *   id = "gutenberg_block",
 *   label = @Translation("Gutenberg block"),
 *   description = @Translation("Gutenberg blocks."),
 *   deriver = "\Drupal\silverback_gutenberg\Plugin\DataType\Deriver\GutenbergBlockDeriver",
 *   definition_class="\Drupal\silverback_gutenberg\TypedData\GutenbergBlockDefinition"
 * )
 */
class GutenbergBlock extends Map {

  public static function fromParsedBlock(array $block) {
    $definition = GutenbergBlockDefinition::create($block['blockName']);
    $instance = new static($definition);
    $children = [];
    foreach ($block['innerBlocks'] as $child) {
      $children = static::fromParsedBlock($child);
    }
    $instance->setValue([
      '__type' => $block['blockName'],
      '__html' => $block['innerHTML'],
      '__children' => $children,
    ]);
    return $instance;
  }

}
