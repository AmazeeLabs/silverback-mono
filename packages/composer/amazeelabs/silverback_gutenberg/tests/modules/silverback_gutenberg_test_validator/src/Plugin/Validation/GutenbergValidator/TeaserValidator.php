<?php

namespace Drupal\silverback_gutenberg_test_validator\Plugin\Validation\GutenbergValidator;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Validate test plugin to check if a title and url attribute exists.
 *
 * @GutenbergValidator(
 *   id="teaser_validator",
 *   label = @Translation("Teaser"),
 * )
 */
class TeaserValidator extends GutenbergValidatorBase {

  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block): bool {
    return $block['blockName'] === 'custom/teaser';
  }

  /**
   * {@inheritDoc}
   */
  public function validatedFields($block = []): array {
    return [
      'title' => [
        'field_label' => $this->t('Title'),
        'rules' => ['required']
      ],
      'url' => [
        'field_label' => $this->t('Link URL'),
        'rules' => ['required']
      ],
    ];
  }

}
