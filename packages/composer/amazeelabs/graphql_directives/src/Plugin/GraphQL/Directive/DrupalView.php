<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;

/**
 * @Directive(
 *   id = "drupalView",
 *   description = "Executes a Drupal view.",
 *   arguments = {
 *     "id" = "String!",
 *     "args" = "String",
 *   },
 * )
 */
class DrupalView extends PluginBase implements DirectiveInterface {
  use ArgumentTrait;

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('drupal_view')
      ->map('id', $builder->fromValue($arguments['id']))
      ->map('args', empty($arguments['args'])
        ? $builder->fromValue(NULL)
        : $this->argumentResolver($arguments['args'], $builder)
      );
  }

}
