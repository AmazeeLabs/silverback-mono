<?php
namespace Drupal\silverback_gutenberg;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\text\Plugin\Field\FieldType\TextWithSummaryItem;

class GutenbergTextWithSummaryItem extends TextWithSummaryItem {

  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    $properties = parent::propertyDefinitions($field_definition);

    $properties['gutenberg_blocks'] = DataDefinition::create('gutenberg_block')
      ->setLabel(t('Gutenberg Document'))
      ->setDescription(t('Parsed Gutenberg blocks.'))
      ->setComputed(TRUE)
      ->setClass('\Drupal\silverback_gutenberg\GutenbergDocument')
      ->setSetting('text source', 'value');

    return $properties;
  }


}
