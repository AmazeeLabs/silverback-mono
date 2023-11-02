<?php

namespace Drupal\graphql_directives\GraphQL\Resolvers;

use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\Utility\DeferredUtility;
use GraphQL\Deferred;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Combine multiple values into one object.
 */
class Hashmap implements ResolverInterface {

  protected array $props;

  /**
   * @param array $props
   *   Dictionary of key value pairs that will be combined into one record.
   */
  public function __construct(array $props) {
    $this->props = $props;
  }

  /**
   * {@inheritdoc}
   */
  public function resolve($value, $args, ResolveContext $context, ResolveInfo $info, FieldContext $field) : array | Deferred {
    return DeferredUtility::waitAll(array_map(function ($prop) use ($value, $args, $context, $info, $field) {
      if ($prop instanceof ResolverInterface) {
        return $prop->resolve($value, $args, $context, $info, $field);
      }
      return $prop;
    }, $this->props));
  }

}
