<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\Annotation\Directive;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "resolveMenuItems",
 *   arguments = {
 *     "max_level" = "Int"
 *   }
 * )
 */
class MenuItems extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->compose(
      $builder->produce('menu_links')
        ->map('menu', $builder->fromParent()),
      $builder->produce('filter_menu_items')
        ->map('items', $builder->fromParent())
        ->map('max_level', $builder->fromValue($arguments['max_level'] ?? 0))
    );
  }

}