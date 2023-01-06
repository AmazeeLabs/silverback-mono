<?php

namespace Drupal\silverback_gatsby_example\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\Annotation\Directive;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\node\NodeInterface;

/**
 * @Directive(
 *   id = "layout",
 * )
 */
class Layout extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->callback(
      fn(NodeInterface $node) => $node->get('promote')->value
        ? 'blog-promoted'
        : NULL
    );
  }

}
