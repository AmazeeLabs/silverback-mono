<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "resolveEditorBlockType"
 * )
 */
class EditorBlockType extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('editor_block_type')->map('block', $builder->fromParent());
  }

}
