<?php

namespace Drupal\silverback_gutenberg\GutenbergValidation;

/**
 * Gutenberg validator plugins interface
 */
interface GutenbergValidatorInterface {

  /**
   * Checks if the validator should apply on a block.
   *
   * @param array $block
   *  A gutenberg block (generated for example by the Gutenberg BlockParser
   *  class).
   *
   * @return bool
   */
  public function applies(array $block): bool;

  /**
   * Returns an array with the validation rules for each field that should be
   * performed on the Gutenberg block. The keys of the array represent the block
   * properties (field names) and the values are arrays with validation rule
   * plugins that should be applied for that field, as well as, optionally, the
   * human-readable label of the field.
   *
   * Example:
   * @code
   * array(
   *   'title' => array(
   *     'field_label' => t('Title'),
   *     'rules' => array('gutenberg_rule_required'),
   *    ),
   *   'caption' => array(
   *     'field_label' => t('Caption'),
   *     'rules' => array('gutenberg_rule_required_caption', 'some_other_rule_plugin'),
   *   ),
   * );
   * @endcode
   *
   * @return array
   */
  public function validatedFields(array $block = []): array;

  /**
   * Validates the content of a block. Useful in case the validator should
   * perform a more complex validation logic, on the entire block, which cannot
   * be covered by the existing validation rules.
   *
   * Use isValid and message keys in the array to display a message
   *
   * Example:
   * @code
   * array(
   *   'is_valid' => FALSE,
   *   'message' => 'Field name is not valid'
   * );
   * @endcode
   *
   * @return array
   */
  public function validateContent(array $block = []): array;

}
