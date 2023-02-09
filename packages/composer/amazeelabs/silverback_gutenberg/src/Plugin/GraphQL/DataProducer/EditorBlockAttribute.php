<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\DataProducer;

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
 *     "plainText" = @ContextDefinition("boolean",
 *       label = @Translation("Whether to process as plain text.")
 *     ),
 *   }
 * )
 */
class EditorBlockAttribute extends DataProducerPluginBase {
  protected function processPlainText(string $text): string {
    // Even if we do not use any HTML markup in a block text, Gutenberg still
    // treats it as HTML, e.g. it turns "<" into "&lt;".
    return html_entity_decode(trim($text));
  }
  public function resolve($block, $name, $plain_text = true) {
    $field_value = $block['attrs'][$name] ?? NULL;
    return $field_value && $plain_text ? $this->processPlainText($field_value) : $field_value;
  }
}
