<?php

namespace Drupal\silverback_gutenberg_test_validator\Plugin\Validation\GutenbergValidator;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Validate test plugin for multiple types of inner blocks.
 *
 * @GutenbergValidator(
 *   id="group_validator",
 *   label = @Translation("Group validator"),
 * )
 */
class GroupValidator extends GutenbergValidatorBase {

  use GutenbergCardinalityValidatorTrait;
  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block): bool {
    return $block['blockName'] === 'core/group';
  }

  /**
   * {@inheritDoc}
   */
  public function validateContent(array $block = []): array {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => $this->t('Paragraph'),
        'min' => 1,
        'max' => 2,
      ],
      [
        'blockName' => 'core/list',
        'blockLabel' => $this->t('List'),
        'min' => 1,
        'max' => 1,
      ],
    ];
    return $this->validateCardinality($block, $expectedChildren);
  }

}
