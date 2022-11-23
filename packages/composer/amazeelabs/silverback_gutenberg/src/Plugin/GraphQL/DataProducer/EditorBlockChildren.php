<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\DataProducer;

use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\silverback_gutenberg\EditorBlocksProcessor;


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
  public function resolve($block, FieldContext $fieldContext) {
    $transientEditorBlocks = $fieldContext->getContextValue('ignored_editor_blocks');
    return EditorBlocksProcessor::processsIgnoredBlocks($block['innerBlocks'] ?? [], $transientEditorBlocks);
  }
}
