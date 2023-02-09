<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\DataProducer;

use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * Return an item from a list at a specified position.
 *
 * @DataProducer(
 *   id = "prop",
 *   name = @Translation("Prop"),
 *   description = @Translation("Extracts an object or map property."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Value")
 *   ),
 *   consumes = {
 *     "input" = @ContextDefinition("any",
 *       label = @Translation("Input object or array"),
 *       required = TRUE
 *     ),
 *     "property" = @ContextDefinition("string",
 *       label = @Translation("Property name")
 *     )
 *   }
 * )
 */
class Prop extends DataProducerPluginBase {

  /**
   * Resolver.
   *
   * @param mixed $input
   *   The input array or object.
   * @param string $prop
   *   The property to extract.
   *
   * @return mixed
   *   The value at the specified property.
   */
  public function resolve($input, $prop) {
    if (is_array($input)) {
      return $input[$prop] ?? NULL;
    }
    if (is_object($input)) {
      return $input->{$prop} ?? NULL;
    }
    return NULL;
  }

}
