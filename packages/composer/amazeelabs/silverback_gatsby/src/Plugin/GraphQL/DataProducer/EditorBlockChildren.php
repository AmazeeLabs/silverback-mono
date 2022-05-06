<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;


/**
 * Resolve any child blocks from an editor block.
 *
 * @DataProducer(
 *   id = "editor_block_children",
 *   name = @Translation("Editor block children"),
 *   description = @Translation("Resolve children from an editor block."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("An array of child blocks")
 *   ),
 *   consumes = {
 *     "block" = @ContextDefinition("any",
 *       label = @Translation("The parsed editor block")
 *     ),
 *   }
 * )
 */
class EditorBlockChildren extends DataProducerPluginBase {
  public function resolve($block) {
    return $block['innerBlocks'] ?? [];
  }
}
