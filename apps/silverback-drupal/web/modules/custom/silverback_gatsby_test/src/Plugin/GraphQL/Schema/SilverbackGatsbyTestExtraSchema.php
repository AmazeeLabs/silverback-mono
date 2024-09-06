<?php

namespace Drupal\silverback_gatsby_test\Plugin\GraphQL\Schema;

use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql_directives\Plugin\GraphQL\Schema\DirectableSchema;

/**
 * @Schema(
 *   id = "silverback_gatsby_test_extra",
 *   name = "Silverback Gatsby Test Extra Schema",
 * )
 */
class SilverbackGatsbyTestExtraSchema extends DirectableSchema {

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = parent::getResolverRegistry();

    $addResolver = function(string $path, ResolverInterface $resolver) use ($registry) {
      [$type, $field] = explode('.', $path);
      $registry->addFieldResolver($type, $field, $resolver);
    };

    $addResolver('Query.extraField', $builder->fromValue('Extra value'));

    return $registry;
  }
}
