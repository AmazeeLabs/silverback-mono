<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Schema;

use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema;

/**
 * @Schema(
 *   id = "silverback_gatsby",
 *   name = "Silverback Gatsby Schema",
 * )
 */
class SilverbackGatsbySchema extends ComposableSchema {

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();
    $this->addFieldResolvers($registry, $builder);
    $this->addTypeResolvers($registry);
    return $registry;
  }

  protected function getSchemaDefinition() {
    $path = $this->moduleHandler->getModule('silverback_gatsby')->getPath();
    return file_get_contents($path . '/graphql/silverback_gatsby.graphqls');
  }

  protected function addFieldResolvers(ResolverRegistry $registry, ResolverBuilder $builder) {

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

    $addResolver('Page.id', $entityId);
    $addResolver('Page.translations', $entityTranslations);

    $addResolver('GutenbergPage.id', $entityId);
    $addResolver('GutenbergPage.translations', $entityTranslations);

    $addResolver('Article.id', $entityId);
    $addResolver('Article.translations', $entityTranslations);
  }

  protected function addTypeResolvers(ResolverRegistry $registry) {
    $registry->addTypeResolver('RootBlock', fn($value) => $value['__type']);
    $registry->addTypeResolver('ContentBlock', fn($value) => $value['__type']);
  }

}
