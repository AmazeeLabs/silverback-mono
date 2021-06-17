<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

/**
 * @DataProducer(
 *   id = "gatsby_extract_id",
 *   name = @Translation("Extract ID from a Gatsby ID "),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("ID"),
 *     multiple = TRUE,
 *   ),
 *   consumes = {
 *     "id" = @ContextDefinition("string",
 *       label = @Translation("Gatsby ID"),
 *       required = TRUE,
 *     )
 *   },
 * )
 */
class GatsbyExtractId extends EntityQueryBase {

  public function resolve(string $id) {
    return explode(':', $id)[0];
  }
}
