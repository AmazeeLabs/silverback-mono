<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "lang",
 *   arguments = {
 *     "code" = "String"
 *   }
 * )
 */
class Lang extends PluginBase implements DirectiveInterface {

  use ArgumentTrait;

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->tap($builder->produce('language_switch')
      ->map('language', isset($arguments['code'])
        ? $this->argumentResolver($arguments['code'], $builder)
        : $builder->fromParent()
      )
    );
  }

}