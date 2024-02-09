<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Directive;

use Drupal\Core\Entity\TranslatableInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @deprecated
 *
 * Duplicates a part of SilverbackGatsbySchemaExtension::addFieldResolvers().
 *
 * @Directive(
 *   id = "silverbackGatsbyEntityId"
 * )
 */
class SilverbackGatsbyEntityId implements  DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, $arguments): ResolverInterface {
    $idResolver = $builder->produce('entity_uuid')
      ->map('entity', $builder->fromParent());
    $langcodeResolver = $builder->callback(
      fn (TranslatableInterface $value) => $value->language()->getId()
    );
    return $builder->produce('gatsby_build_id')
      ->map('id', $idResolver)
      ->map('langcode', $langcodeResolver);
  }

}
