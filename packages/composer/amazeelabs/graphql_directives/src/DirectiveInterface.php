<?php

namespace Drupal\graphql_directives;

use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;

/**
 * Interface definition for GraphQL directives.
 */
interface DirectiveInterface {

  /**
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   * @param array $arguments
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function buildResolver(
    ResolverBuilder $builder,
    array $arguments
  ) : ResolverInterface;
}
