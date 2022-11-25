<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;

/**
 * @Directive(
 *   id = "resolveEntityLabel",
 *   description = "Retrieve an entities label."
 * )
 */
class EntityLabel extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('entity_label')
      ->map('entity', $builder->fromParent());
  }

}
