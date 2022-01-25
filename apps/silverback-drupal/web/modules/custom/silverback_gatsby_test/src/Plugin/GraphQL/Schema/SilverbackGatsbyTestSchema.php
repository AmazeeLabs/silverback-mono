<?php

namespace Drupal\silverback_gatsby_test\Plugin\GraphQL\Schema;

use Drupal\Core\Entity\EntityInterface;
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

    $registry->addTypeResolver('PageParagraphs', function (EntityInterface $value) {
      switch ($value->bundle()) {
        case 'text':
          return 'ParagraphText';
        case 'references':
          return 'ParagraphReferences';
        default:
          throw new \Exception('Unknown paragraph type: "' . $value->getEntityTypeId() . ':' . $value->bundle() . '"');
      }
    });

    $imageUrl = $builder->compose(
      $builder->produce('property_path', [
        'path' => $builder->fromValue('field_media_image.0.entity'),
        'value' => $builder->fromParent(),
        'type' => $builder->fromValue('entity:media:image'),
      ]),
      $builder->produce('image_url')
        ->map('entity', $builder->fromParent())
    );

    $gutenberg = $builder->produce('gutenberg')
      ->map('entity', $builder->fromParent());

    $articleTemplate = $builder->callback(
      fn(NodeInterface $node) => $node->get('promote')->value
        ? 'article-promoted'
        : NULL
    );

    $addResolver('GutenbergPage.body', $gutenberg);

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

    $addResolver('Webform.url',
      $builder->compose(
        $builder->produce('entity_url')->map('entity', $builder->fromParent()),
        $builder->callback(fn (Url $url) => $url->setAbsolute()->toString(TRUE)->getGeneratedUrl())
      )
    );

    return $registry;
  }
}
