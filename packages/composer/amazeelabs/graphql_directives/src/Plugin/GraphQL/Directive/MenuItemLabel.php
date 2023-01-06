<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;

/**
 * @Directive(
 *   id = "resolveMenuItemLabel"
 * )
 */
class MenuItemLabel extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, $arguments): ResolverInterface {
    return $builder->compose(
      $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
      $builder->produce('menu_link_label')->map('link', $builder->fromParent()),
    );
  }

}