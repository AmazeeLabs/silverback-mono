<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Directive;

use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\system\Entity\Menu;

/**
 * @deprecated
 *
 * Duplicates MenuFeed::resolveLangcode().
 *
 * @Directive(
 *   id = "menuLangcode"
 * )
 */
class MenuLangcode implements  DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, $arguments): ResolverInterface {
    return $builder->callback(
      fn (Menu $value) => $value->language()->getId()
    );
  }

}
