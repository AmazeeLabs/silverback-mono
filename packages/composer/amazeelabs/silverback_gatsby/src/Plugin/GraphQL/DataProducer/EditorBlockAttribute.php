<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;


/**
 * Resolves the attribute value from an editor block.
 *
 * @DataProducer(
 *   id = "editor_block_attribute",
 *   name = @Translation("Editor block attribute value"),
 *   description = @Translation("Resolve an attribute value from an editor block."),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("The attribute value")
 *   ),
 *   consumes = {
 *     "block" = @ContextDefinition("any",
 *       label = @Translation("The parsed editor block")
 *     ),
 *     "name" = @ContextDefinition("string",
 *       label = @Translation("The attribute name.")
 *     ),
 *   }
 * )
 */
class EditorBlockAttribute extends DataProducerPluginBase {
  public function resolve($block, $name) {
    return $block['attrs'][$name] ?? NULL;
  }
}
