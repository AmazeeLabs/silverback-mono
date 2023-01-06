<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;

/**
 * @Directive(
 *   id = "route",
 *   description = "Resolve a path to an Url object.",
 *   arguments = {
 *     "path" = "String!"
 *   }
 * )
 */
class Route extends PluginBase implements DirectiveInterface {
  use ArgumentTrait;
  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('route_load')
      ->map('path', $this->argumentResolver($arguments['path'], $builder));
  }
}
