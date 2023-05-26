<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql_directives\Plugin\GraphQL\Directive\ArgumentTrait;

/**
 * @Directive(
 *   id = "fetchEntity",
 *   description = "Fetch an entity or entity revision based on id, rid or route",
 *   arguments = {
 *     "type" = "String",
 *     "id" = "String",
 *     "rid" = "String",
 *     "language" = "String",
 *     "operation" = "String"
 *   }
 * )
 */
class EntityFetch extends PluginBase implements DirectiveInterface {
  use ArgumentTrait;

  /**
   * {@inheritDoc}
   * @throws \Exception
   */
  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('fetch_entity')
      ->map('type', $this->argumentResolver($arguments['type'], $builder))
      ->map('id', $this->argumentResolver($arguments['id'], $builder))
      ->map('revision_id', $this->argumentResolver($arguments['rid'], $builder))
      ->map('language', $this->argumentResolver($arguments['language'], $builder))
      ->map('operation', $this->argumentResolver($arguments['operation'], $builder));
  }

}
