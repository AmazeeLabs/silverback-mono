<?php

namespace Drupal\silverback_gutenberg_test_validator\Plugin\Validation\GutenbergValidator;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorInterface;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Validate test plugin for the ANY cardinality.
 *
 * @GutenbergValidator(
 *   id="column_validator",
 *   label = @Translation("Column validator"),
 * )
 */
class ColumnValidator extends GutenbergValidatorBase {

  use GutenbergCardinalityValidatorTrait;
  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block): bool {
    return $block['blockName'] === 'core/column';
  }

  /**
   * {@inheritDoc}
   */
  public function validateContent(array $block = []): array {
    $expectedChildren = [
      'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
      'min' => 1,
      'max' => 2,
    ];
    return $this->validateCardinality($block, $expectedChildren);
  }

}
