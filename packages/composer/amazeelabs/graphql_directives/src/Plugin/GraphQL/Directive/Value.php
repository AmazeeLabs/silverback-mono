<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "value",
 *   description = "Provide a static value as JSON string.",
 *   arguments = {
 *     "json" = "String",
 *     "int" = "Int",
 *     "float" = "Float",
 *     "string" = "String",
 *     "boolean" = "Boolean"
 *   }
 * )
 */
class Value extends PluginBase implements DirectiveInterface {

  /**
   * {@inheritdoc}
   */
  public function buildResolver(
    ResolverBuilder $builder,
    array $arguments
  ) : ResolverInterface {
    if (array_key_exists('json', $arguments)) {
      return $builder->fromValue(json_decode($arguments['json']));
    }
    foreach(['string', 'int', 'float', 'boolean'] as $key) {
      if (array_key_exists($key, $arguments)) {
        return $builder->fromValue($arguments[$key]);
      }
    }
    return $builder->fromValue(NULL);
  }
}
