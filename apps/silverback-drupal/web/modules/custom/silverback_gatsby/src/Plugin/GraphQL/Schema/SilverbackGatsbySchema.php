<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Schema;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema;
use Drupal\graphql\Plugin\SchemaExtensionPluginManager;
use Drupal\silverback_gatsby\FeedInterface;

/**
 * @Schema(
 *   id = "silverback_gatsby",
 *   name = "Silverback Gatsby Schema",
 * )
 */
class SilverbackGatsbySchema extends ComposableSchema {

  protected array $feeds;

  public function __construct(
    array $configuration,
    $pluginId,
    array $pluginDefinition,
    CacheBackendInterface $astCache,
    ModuleHandlerInterface $moduleHandler,
    SchemaExtensionPluginManager $extensionManager,
    array $config
  ) {
    parent::__construct(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $astCache,
      $moduleHandler,
      $extensionManager,
      $config
    );
    $this->feeds = \Drupal::getContainer()
      ->get('silverback_gatsby.feed_manager')->getFeeds();
  }

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();
    $this->addFieldResolvers($registry, $builder);
    return $registry;
  }

  protected function getSchemaDefinition() {
    $fields = implode("\n", array_map(fn (FeedInterface $feed) => $feed->queryFieldDefinitions(), $this->feeds));
    $types = implode("\n", array_map(fn (FeedInterface $feed) => $feed->typeDefinitions(), $this->feeds));
    return <<<GQL
schema {
  query: Query
}

type Change {
  type: ChangeType!
  id: String!
}

enum ChangeType {
  Update
  Delete
}

interface Translatable {
  id: String!
  translations: [Translation!]!
}

interface Translation {
  langcode: String!
}

type Feed {
  typeName: String!
  translationTypeName: String
  singleFieldName: String!
  listFieldName: String!
  changesFieldName: String
}

type Query {
  drupalFeedInfo: [Feed!]!
$fields
}

$types
GQL;
  }

  protected function addFieldResolvers(ResolverRegistry $registry, ResolverBuilder $builder) {

    // Helpers.

    $addResolver = function(string $path, ResolverInterface $resolver) use ($registry) {
      [$type, $field] = explode('.', $path);
      $registry->addFieldResolver($type, $field, $resolver);
    };

    $addResolver('Query.drupalFeedInfo',
      $builder->fromValue(array_map(fn (FeedInterface $feed) => $feed->info(), $this->feeds))
    );

    foreach($this->feeds as $feed) {
      $info = $feed->info();
      $registry->addFieldResolver('Query', $info['singleFieldName'], $feed->resolveItem());
      $registry->addFieldResolver('Query', $info['listFieldName'], $feed->resolveItems());
      if ($info['changesFieldName'] && $feed->resolveChanges()) {
        $registry->addFieldResolver('Query', $info['changesFieldName'], $feed->resolveChanges());
      }

      $registry->addFieldResolver($info['typeName'], 'id', $feed->resolveId());
      if ($info['translationTypeName'] && $feed->resolveTranslations()) {
        $registry->addFieldResolver($info['typeName'], 'translations', $feed->resolveTranslations());
      }
    }
  }

}
