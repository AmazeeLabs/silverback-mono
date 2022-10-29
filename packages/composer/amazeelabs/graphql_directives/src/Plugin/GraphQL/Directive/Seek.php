<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "seek",
 *   description = "Seek a specific element in a list.",
 *   arguments = {
 *     "pos" = "Int!",
 *   }
 * )
 */
class Seek extends PluginBase implements DirectiveInterface {

  public function buildResolver(
    ResolverBuilder $builder,
    array $arguments
  ): ResolverInterface {
    return $builder->produce('seek')
      ->map('input', $builder->fromParent())
      ->map('position', $builder->fromValue($arguments['pos']));
  }

}
