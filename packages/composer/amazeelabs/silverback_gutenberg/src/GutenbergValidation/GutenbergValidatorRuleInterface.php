<?php

namespace Drupal\silverback_gutenberg\GutenbergValidation;

/**
 * Gutenberg validator rule plugins interface.
 */
interface GutenbergValidatorRuleInterface {

  /**
   * Validates a value.
   *
   * @param $value
   * @param $fieldLabel
   *
   * @return bool
   */
  public function validate($value, $fieldLabel): bool;

}
