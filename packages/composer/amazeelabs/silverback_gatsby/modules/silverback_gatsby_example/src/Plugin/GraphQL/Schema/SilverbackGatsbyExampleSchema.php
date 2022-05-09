<?php
namespace Drupal\silverback_gatsby_example\Plugin\GraphQL\Schema;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\node\NodeInterface;
use Drupal\silverback_gatsby\GraphQL\ComposableSchema;

/**
 * @Schema(
 *   id = "silverback_gatsby_example",
 *   name = "Silverback Gatsby Example Schema",
 * )
 */
class SilverbackGatsbyExampleSchema extends ComposableSchema {

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();

    $registry->addFieldResolver('Post', 'template',
      $builder->callback(
        fn(NodeInterface $node) => $node->get('promote')->value
          ? 'blog-promoted'
          : NULL
      )
    );

    return $registry;
  }
}
