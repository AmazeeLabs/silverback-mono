<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Directive;

use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @deprecated
 *
 * Duplicates EntityFeed::resolveTranslations().
 *
 * @Directive(
 *   id = "entityTranslationsWithDefault"
 * )
 */
class EntityTranslationsWithDefault implements  DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, $arguments): ResolverInterface {
    return $builder->defaultValue(
      $builder->compose(
        $builder->produce('entity_translations')->map('entity', $builder->fromParent()),
        $builder->callback(fn ($entities) => $entities ? array_filter($entities) : NULL)
      ),
      $builder->callback(fn ($value) => [$value])
    );
  }

}
