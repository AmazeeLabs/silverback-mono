<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Directive;

use Drupal\Core\Language\LanguageInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\system\Entity\Menu;

/**
 *
 * @deprecated
 *
 * Duplicates MenuFeed::resolveTranslations().
 *
 * @Directive(
 *   id = "menuTranslations"
 * )
 */
class MenuTranslations implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, $arguments): ResolverInterface {
    return $builder->compose($builder->callback(function(Menu $menu) {
      return array_map(
        function(LanguageInterface $lang) use ($menu) {
          $clone = clone $menu;
          $clone->set('langcode', $lang->getId());
          return $clone;
        },
        \Drupal::languageManager()->getLanguages()
      );
    }));
  }

}
