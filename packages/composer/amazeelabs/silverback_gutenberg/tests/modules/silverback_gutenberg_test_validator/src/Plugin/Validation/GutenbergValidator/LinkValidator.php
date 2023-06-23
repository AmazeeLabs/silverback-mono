<?php

namespace Drupal\silverback_gutenberg_test_validator\Plugin\Validation\GutenbergValidator;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Validate test plugin to check if a linkUrl and linkLabel attribute exists.
 *
 * @GutenbergValidator(
 *   id="link_validator",
 *   label = @Translation("Link URL"),
 * )
 */
class LinkValidator extends GutenbergValidatorBase {

  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block): bool {
    return $block['blockName'] === 'custom/link';
  }

  /**
   * {@inheritDoc}
   */
  public function validatedFields($block = []): array {
    return [
      'linkUrl' => [
        'field_label' => $this->t('Link URL'),
        'rules' => ['required']
      ],
      'linkLabel' => [
        'field_label' => $this->t('Link Label'),
        'rules' => ['required']
      ],
    ];
  }

}
