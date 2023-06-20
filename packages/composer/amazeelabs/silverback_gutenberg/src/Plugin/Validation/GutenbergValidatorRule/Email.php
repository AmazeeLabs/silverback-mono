<?php

namespace Drupal\silverback_gutenberg\Plugin\Validation\GutenbergValidatorRule;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * @GutenbergValidatorRule(
 *   id="email",
 *   label = @Translation("Email")
 * )
 */
class Email implements GutenbergValidatorRuleInterface {

  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function validate($value, $fieldLabel): bool|string {
    if (!empty($value) && !\Drupal::service('email.validator')->isValid($value)) {
      return $this->t('%field is not valid.', ['%field' => $fieldLabel]);
    }
    return TRUE;
  }

}
