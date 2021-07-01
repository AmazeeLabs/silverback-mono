<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

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
class GatsbyExtractLangcode extends DataProducerPluginBase {

  public function resolve(string $id) {
    return explode(':', $id)[1];
  }
}
