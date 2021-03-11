<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Schema;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Url;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\Schema\SdlSchemaPluginBase;
use Drupal\node\NodeInterface;

/**
 * @Schema(
 *   id = "silverback_gatsby",
 *   name = "Silverback Gatsby Schema",
 * )
 */
class SilverbackGatsbySchema extends SdlSchemaPluginBase {

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();
    $this->addResolvers($registry, $builder);
    return $registry;
  }

  protected function addResolvers(ResolverRegistry $registry, ResolverBuilder $builder) {

    // Helpers.

    $addResolver = function(string $path, ResolverInterface $resolver) use ($registry) {
      [$type, $field] = explode('.', $path);
      $registry->addFieldResolver($type, $field, $resolver);
    };

    $loadEntity = fn(string $type, string $bundle) => $builder->produce('entity_load')
      ->map('type', $builder->fromValue($type))
      ->map('bundles', $builder->fromValue([$bundle]))
      ->map('id', $builder->fromArgument('id'));

    $listEntities = fn(string $type, string $bundle) => $builder->produce('list_entities')
      ->map('type', $builder->fromValue($type))
      ->map('bundle', $builder->fromValue($bundle))
      ->map('offset', $builder->fromArgument('offset'))
      ->map('limit', $builder->fromArgument('limit'));

    $entityChanges = fn(string $type, string $bundle) => $builder->produce('entity_changes')
      ->map('type', $builder->fromValue($type))
      ->map('bundle', $builder->fromValue($bundle))
      ->map('since', $builder->fromArgument('since'))
      ->map('ids', $builder->fromArgument('ids'));

    $entityId = $builder->produce('entity_id')
      ->map('entity', $builder->fromParent());

    $entityTranslations = $builder->produce('entity_translations')
      ->map('entity', $builder->fromParent());

    $entityLangcode = $builder->callback(
      fn(TranslatableInterface $value) => $value->language()->getId()
    );

    $entityLabel = $builder->callback(fn(EntityInterface $value) => $value->label());

    $fromPath = fn(string $type, string $path, $value = NULL) => $builder->produce('property_path', [
      'path' => $builder->fromValue($path),
      'value' => $value ?: $builder->fromParent(),
      'type' => $builder->fromValue($type),
    ]);

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
      $fromPath('entity:media:image', 'field_media_image.0.entity'),
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

    // Resolvers.

    $addResolver('Query.page', $loadEntity('node', 'page'));
    $addResolver('Query.pages', $listEntities('node', 'page'));
    $addResolver('Query.pageChanges', $entityChanges('node', 'page'));

    $addResolver('Query.gutenbergPage', $loadEntity('node', 'gutenberg_page'));
    $addResolver('Query.gutenbergPages', $listEntities('node', 'gutenberg_page'));
    $addResolver('Query.gutenbergPageChanges', $entityChanges('node', 'gutenberg_page'));

    $addResolver('Query.article', $loadEntity('node', 'article'));
    $addResolver('Query.articles', $listEntities('node', 'article'));
    $addResolver('Query.articleChanges', $entityChanges('node', 'article'));

    $addResolver('Query.image', $loadEntity('media', 'image'));
    $addResolver('Query.images', $listEntities('media', 'image'));
    $addResolver('Query.imageChanges', $entityChanges('media', 'image'));

    $addResolver('Query.tag', $loadEntity('taxonomy_term', 'tag'));
    $addResolver('Query.tags', $listEntities('taxonomy_term', 'tag'));
    $addResolver('Query.tagChanges', $entityChanges('taxonomy_term', 'tag'));

    $addResolver('Page.id', $entityId);
    $addResolver('Page.translations', $entityTranslations);
    $addResolver('PageTranslation.langcode', $entityLangcode);
    $addResolver('PageTranslation.path', $nodePath);
    $addResolver('PageTranslation.title', $entityLabel);
    $addResolver('PageTranslation.body', $fromPath('entity:node:page', 'field_body.0.processed'));

    $addResolver('GutenbergPage.id', $entityId);
    $addResolver('GutenbergPage.translations', $entityTranslations);
    $addResolver('GutenbergPageTranslation.langcode', $entityLangcode);
    $addResolver('GutenbergPageTranslation.path', $nodePath);
    $addResolver('GutenbergPageTranslation.title', $entityLabel);
    $addResolver('GutenbergPageTranslation.body', $fromPath('entity:node:gutenberg_page', 'body.0.value'));

    $addResolver('Article.id', $entityId);
    $addResolver('Article.translations', $entityTranslations);
    $addResolver('ArticleTranslation.langcode', $entityLangcode);
    $addResolver('ArticleTranslation.path', $nodePath);
    $addResolver('ArticleTranslation.title', $entityLabel);
    $addResolver('ArticleTranslation.body', $fromPath('entity:node:article', 'field_body.0.processed'));
    $addResolver('ArticleTranslation.tags', $entityReferences('field_tags'));
    $addResolver('ArticleTranslation.image', $firstEntityReference('field_image'));

    $addResolver('Image.id', $entityId);
    $addResolver('Image.alt', $fromPath('entity:media:image', 'field_media_image.0.alt'));
    $addResolver('Image.url', $imageUrl);

    $addResolver('Tag.id', $entityId);
    $addResolver('Tag.title', $entityLabel);
  }

}
