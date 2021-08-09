<?php

namespace Drupal\silverback_gutenberg;

use Drupal\Core\TypedData\DataDefinitionInterface;
use Drupal\Core\TypedData\TypedData;
use Drupal\Core\TypedData\TypedDataInterface;
use Drupal\gutenberg\Parser\BlockParser;
use Drupal\silverback_gutenberg\Plugin\DataType\GutenbergBlock;

class GutenbergDocument extends TypedData {

  /**
   * Cached parsed blocks.
   *
   * @var \Drupal\silverback_gutenberg\Plugin\DataType\GutenbergBlock|null
   */
  protected GutenbergBlock $document;

  /**
   * {@inheritdoc}
   */
  public function __construct(DataDefinitionInterface $definition, $name = NULL, TypedDataInterface $parent = NULL) {
    parent::__construct($definition, $name, $parent);

    if ($definition->getSetting('text source') === NULL) {
      throw new \InvalidArgumentException("The definition's 'text source' key has to specify the name of the text property to be parsed.");
    }
  }

  public function getValue() {
    if (!isset($this->document)) {
      $text = $this->getParent()->{$this->definition->getSetting('text source')};
      $blocks = (new BlockParser())->parse($text);
      $this->document = GutenbergBlock::fromParsedBlock([
        'blockName' => 'silverback/root',
        'attrs' => [],
        'innerHTML' => '',
        'innerContent' => '',
        'innerBlocks' => $blocks,
      ]);
    }
    return $this->document;
  }

}
