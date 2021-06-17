<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

/**
 * @DataProducer(
 *   id = "gatsby_extract_langcode",
 *   name = @Translation("Extract langcode from a Gatsby ID "),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("Langcode"),
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
class GatsbyExtractLangcode extends EntityQueryBase {

  public function resolve(string $id) {
    return explode(':', $id)[1];
  }
}
