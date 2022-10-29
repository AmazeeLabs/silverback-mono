<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "value",
 *   description = "Provide a static value as JSON string.",
 *   arguments = {
 *     "json" = "String!",
 *   }
 * )
 */
class Value extends PluginBase implements DirectiveInterface {

  /**
   * {@inheritdoc}
   */
  public function buildResolver(
    ResolverBuilder $builder,
    array $arguments
  ) : ResolverInterface {
    return $builder->fromValue(json_decode($arguments['json']));
  }
}
