<?php

namespace Drupal\silverback_gutenberg\Plugin\Validation\GutenbergValidatorRule;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * @GutenbergValidatorRule(
 *   id="required",
 *   label = @Translation("Required")
 * )
 */
class Required implements GutenbergValidatorRuleInterface {

  use StringTranslationTrait;
  public $requiredMessage = '%field field is required.';

  /**
   * {@inheritDoc}
   */
  public function validate($value, $fieldLabel): bool|string {
    if (empty($value) || $value === '_none') {
      return $this->t($this->requiredMessage, ['%field' => $fieldLabel]);
    }
    return TRUE;
  }

}
