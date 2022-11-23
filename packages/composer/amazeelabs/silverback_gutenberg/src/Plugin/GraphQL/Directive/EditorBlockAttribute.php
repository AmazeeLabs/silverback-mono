<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "resolveEditorBlockAttribute",
 *   description = "Retrieve an editor block attribute.",
 *   arguments = {
 *     "key" = "String!",
 *     "plainText" = "Boolean"
 *   }
 * )
 */
class EditorBlockAttribute extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('editor_block_attribute')
      ->map('block', $builder->fromParent())
      ->map('name', $builder->fromValue($arguments['key']))
      ->map('plainText', $builder->fromValue($arguments['plainText'] ?? true));
  }

}
