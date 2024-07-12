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
 *     "operation" = "String",
 *     "preview_user_id" = "String",
 *     "preview_access_token" = "String"
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
    $resolver = $builder->produce('fetch_entity')
      ->map('type', $this->argumentResolver($arguments['type'], $builder))
      ->map('id', $this->argumentResolver($arguments['id'], $builder))
      ->map('revision_id', $this->argumentResolver($arguments['rid'], $builder))
      ->map('language', $this->argumentResolver($arguments['language'], $builder))
      ->map('preview_user_id', $this->argumentResolver($arguments['preview_user_id'], $builder))
      ->map('preview_access_token', $this->argumentResolver($arguments['preview_access_token'], $builder));
    // If empty, delegate to access_operation default value
    // from the fetch_entity data producer.
    if (!empty($arguments['operation'])) {
      $resolver->map('access_operation', $this->argumentResolver($arguments['operation'], $builder));
    }
    return $resolver;
  }

}
