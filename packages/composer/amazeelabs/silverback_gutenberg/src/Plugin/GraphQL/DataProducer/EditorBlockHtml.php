<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;


/**
 * Resolves the HTML content inside an editor block.
 *
 * @DataProducer(
 *   id = "editor_block_html",
 *   name = @Translation("Editor block inner html"),
 *   description = @Translation("Resolve html content from an editor block."),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("The HTML content of the block")
 *   ),
 *   consumes = {
 *     "block" = @ContextDefinition("any",
 *       label = @Translation("The parsed editor block")
 *     ),
 *   }
 * )
 */
class EditorBlockHtml extends DataProducerPluginBase {
  public function resolve($block) {
    return $block['innerHTML'];
  }
}
