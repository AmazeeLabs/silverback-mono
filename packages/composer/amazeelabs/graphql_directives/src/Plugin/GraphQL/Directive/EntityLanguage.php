<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;

/**
 * @Directive(
 *   id = "resolveEntityLanguage",
 *   description = "Retrieve the language of an entity."
 * )
 */
class EntityLanguage extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->compose(
      $builder->produce('entity_language')->map('entity', $builder->fromParent()),
      $builder->callback(fn (LanguageInterface $language) => $language->getId()),
    );
  }

}
