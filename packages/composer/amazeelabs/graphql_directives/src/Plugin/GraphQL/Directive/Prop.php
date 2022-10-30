<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "prop",
 *   description = "Retrieve an object or map property.",
 *   arguments = {
 *     "key" = "String!",
 *   }
 * )
 */
class Prop extends PluginBase implements DirectiveInterface {

  public function buildResolver(
    ResolverBuilder $builder,
    array $arguments
  ): ResolverInterface {
    return $builder->produce('prop')
      ->map('input', $builder->fromParent())
      ->map('property', $builder->fromValue($arguments['key']));
  }

}
