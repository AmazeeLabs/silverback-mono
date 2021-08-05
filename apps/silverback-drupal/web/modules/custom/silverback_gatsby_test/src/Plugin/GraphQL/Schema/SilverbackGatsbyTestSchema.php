<?php
namespace Drupal\silverback_gatsby_test\Plugin\GraphQL\Schema;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Url;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\node\NodeInterface;
use Drupal\silverback_gatsby\GraphQL\ComposableSchema;

/**
 * @Schema(
 *   id = "silverback_gatsby_test",
 *   name = "Silverback Gatsby Test Schema",
 * )
 */
class SilverbackGatsbyTestSchema extends ComposableSchema {

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();

    $addResolver = function(string $path, ResolverInterface $resolver) use ($registry) {
      [$type, $field] = explode('.', $path);
      $registry->addFieldResolver($type, $field, $resolver);
    };

    $registry->addTypeResolver('RootBlock', fn($value) => $value['__type']);
    $registry->addTypeResolver('ContentBlock', fn($value) => $value['__type']);

    $entityReferences = fn(string $field) => $builder->defaultValue(
      $builder->produce('entity_reference')
        ->map('entity', $builder->fromParent())
        ->map('field', $builder->fromValue($field)),
      $builder->fromValue([])
    );

    $firstEntityReference = fn(string $field) => $builder->callback(
      fn(FieldableEntityInterface $value) => $value->get($field)->entity
    );

    $imageUrl = $builder->compose(
      $builder->produce('property_path', [
        'path' => $builder->fromValue('field_media_image.0.entity'),
        'value' => $builder->fromParent(),
        'type' => $builder->fromValue('entity:media:image'),
      ]),
      $builder->produce('image_url')
        ->map('entity', $builder->fromParent())
    );

    $nodePath = $builder->callback(fn(NodeInterface $value) => Url::fromRoute(
      'entity.node.canonical',
      ['node' => $value->id()],
      ['language' => $value->language()]
    )
      ->setAbsolute(FALSE)
      ->toString(TRUE)
      ->getGeneratedUrl()
    );

    $gutenberg = $builder->produce('gutenberg')
      ->map('entity', $builder->fromParent());

    $articleTemplate = $builder->callback(
      fn(NodeInterface $node) => $node->get('promote')->value
        ? 'article-promoted'
        : NULL
    );

    $addResolver('Page.path', $nodePath);

    $addResolver('GutenbergPage.path', $nodePath);
    $addResolver('GutenbergPage.body', $gutenberg);

    $addResolver('Article.path', $nodePath);
    $addResolver('Article.tags', $entityReferences('field_tags'));
    $addResolver('Article.image', $firstEntityReference('field_image'));
    $addResolver('Article.template', $articleTemplate);

    $addResolver('Image.url', $imageUrl);

    $addResolver('MenuItem.label', $builder->compose(
      $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
      $builder->produce('menu_link_label')->map('link', $builder->fromParent()),
    ));

    $addResolver('MenuItem.url', $builder->compose(
      $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
      $builder->produce('menu_link_url')->map('link', $builder->fromParent()),
      $builder->produce('url_path')->map('url', $builder->fromParent()),
    ));

    return $registry;
  }
}
