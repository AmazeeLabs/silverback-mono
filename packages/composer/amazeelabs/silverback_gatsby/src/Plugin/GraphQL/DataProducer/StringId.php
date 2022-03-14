<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\locale\StringInterface;

/**
 * Returns the ID of a String.
 *
 * @DataProducer(
 *   id = "string_id",
 *   name = @Translation("String identifier"),
 *   description = @Translation("Returns the string identifier."),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("Identifier")
 *   ),
 *   consumes = {
 *     "string" = @ContextDefinition("any",
 *       label = @Translation("String")
 *     )
 *   }
 * )
 */
class StringId extends DataProducerPluginBase {

  /**
   * Resolver.
   *
   * @param \Drupal\locale\StringInterface $string
   *
   * @return int|string|null
   */
  public function resolve(StringInterface $string) {
    return $string->getId();
  }
}
