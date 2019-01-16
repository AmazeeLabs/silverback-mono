<?php

namespace Drupal\webform_jsonschema\Encoder;

use Drupal\serialization\Encoder\JsonEncoder as SerializationJsonEncoder;
use Symfony\Component\Serializer\Encoder\NormalizationAwareInterface;

/**
 * Custom JSON Encoder.
 *
 * Drupal's JSON encoder is not normalization aware, which makes normalization
 * mandatory for it. This means that only arrays and scalars are allowed to be
 * used with it. Also, it makes it impossible to represent an empty object in
 * the resulting JSON:
 * - the only way to add an empty object to JSON with json_encode - use
 *   "new stdClass()"
 * - the standard normalizer throws an error when meet an object
 *
 * This encoder is normalization aware, which means no normalizer will be used,
 * and "new stdClass()" can be used to make empty objects.
 */
class JsonEncoder extends SerializationJsonEncoder implements NormalizationAwareInterface {

  /**
   * The formats that this Encoder supports.
   *
   * @var array
   */
  protected static $format = ['webform_jsonschema'];

}
