<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;


use Drupal\Core\Plugin\PluginBase;
use Drupal\Core\TypedData\TranslatableInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "resolveEntityReferenceRevisions",
 *   arguments = {
 *     "field" = "String!"
 *   }
 * )
 */
class EntityReferenceRevisions extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('entity_reference_revisions')
      ->map('entity', $builder->fromParent())
      ->map('language', $builder->callback(
        fn(TranslatableInterface $value) => $value->language()->getId()
      ))
      ->map('field', $builder->fromValue($arguments['field']));
  }

}