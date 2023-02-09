<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\DataProducer;

use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;


/**
 * Resolves the HTML content inside an editor block.
 *
 * @DataProducer(
 *   id = "editor_block_type",
 *   name = @Translation("Editor block type"),
 *   description = @Translation("Resolve an editor blocks type."),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("The blocks typename")
 *   ),
 *   consumes = {
 *     "block" = @ContextDefinition("any",
 *       label = @Translation("The parsed editor block")
 *     ),
 *   }
 * )
 */
class EditorBlockType extends DataProducerPluginBase {
  public function resolve($block) {
    return $block['blockName'];
  }
}
