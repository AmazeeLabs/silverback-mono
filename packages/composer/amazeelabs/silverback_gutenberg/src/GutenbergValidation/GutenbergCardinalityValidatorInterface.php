<?php

namespace Drupal\silverback_gutenberg\GutenbergValidation;

interface GutenbergCardinalityValidatorInterface {

  /**
   * @var int
   *   Value that can be used for the maximum.
   */
  const CARDINALITY_UNLIMITED = -1;

  /**
   * @var string
   *  Specifies if the cardinality check is not limited to a given block type.
   */
  const CARDINALITY_ANY = 'any';

}
