<?php

namespace Drupal\silverback_gutenberg\GutenbergValidation;

/**
 * Base class for all the Gutenberg validators.
 */
abstract class GutenbergValidatorBase implements GutenbergValidatorInterface {

  /**
   * {@inheritDoc}
   */
  public function validateContent(array $block = []): array {
    return [];
  }

  /**
   * {@inheritDoc}
   */
  public function validatedFields(array $block = []): array {
    return [];
  }

}
