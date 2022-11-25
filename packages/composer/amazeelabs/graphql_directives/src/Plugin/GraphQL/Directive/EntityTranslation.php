<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;

/**
 * @Directive(
 *   id = "resolveEntityTranslation",
 *   description = "Retrieve a specific translation of an entity.",
 *   arguments = {
 *     "lang" = "String!"
 *   }
 * )
 */
class EntityTranslation extends PluginBase implements DirectiveInterface {
  use ArgumentTrait;

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('entity_translation')
      ->map('entity', $builder->fromParent())
      ->map('language', $this->argumentResolver($arguments['lang'], $builder));
  }

}
