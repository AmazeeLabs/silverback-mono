<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;

/**
 * @Directive(
 *   id = "resolveEntityPath",
 *   description = "Retrieve an entities url path."
 * )
 */
class EntityPath extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->compose(
      $builder->produce('entity_url')->map('entity', $builder->fromParent()),
      $builder->produce('url_path')->map('url', $builder->fromParent()),
      $builder->produce('sanitize_path')->map('raw', $builder->fromParent()),
    );
  }

}
