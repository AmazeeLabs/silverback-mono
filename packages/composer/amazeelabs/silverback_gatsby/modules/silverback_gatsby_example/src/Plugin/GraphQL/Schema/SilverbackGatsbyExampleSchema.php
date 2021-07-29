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

    foreach (['Page', 'Post'] as $type) {
      $registry->addFieldResolver($type, 'path',
        $builder->compose(
          $builder->produce('entity_url')->map('entity', $builder->fromParent()),
          $builder->produce('url_path')->map('url', $builder->fromParent())
        )
      );
      $registry->addFieldResolver($type, 'title',
        $builder->produce('entity_label')->map('entity', $builder->fromParent())
      );
    }
    $registry->addFieldResolver('Post', 'template',
      $builder->callback(
        fn(NodeInterface $node) => $node->get('promote')->value
          ? 'blog-promoted'
          : NULL
      )
    );

    $registry->addFieldResolver('MenuItem', 'label', $builder->compose(
      $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
      $builder->produce('menu_link_label')->map('link', $builder->fromParent()),
    ));

    $registry->addFieldResolver('MenuItem', 'url', $builder->compose(
      $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
      $builder->produce('menu_link_url')->map('link', $builder->fromParent()),
      $builder->produce('url_path')->map('url', $builder->fromParent()),
    ));

    return $registry;
  }
}
