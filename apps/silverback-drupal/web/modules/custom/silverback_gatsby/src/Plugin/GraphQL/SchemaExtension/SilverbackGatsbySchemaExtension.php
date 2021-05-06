<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Drupal\silverback_gatsby\FeedInterface;

/**
 * @SchemaExtension(
 *   id = "silverback_gatsby",
 *   name = "Silverback Gatsby",
 *   description = "Schema extension providing default resolvers for Gatsby."
 * )
 */
class SilverbackGatsbySchemaExtension extends SdlSchemaExtensionPluginBase {

  protected array $feeds = [];

  protected function getFeeds() {
    if (count($this->feeds) === 0) {
      $this->feeds = \Drupal::getContainer()
        ->get('silverback_gatsby.feed_manager')->getFeeds();
    }
    return $this->feeds;
  }

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();
    $this->addFieldResolvers($registry, $builder);
    return $registry;
  }

  public function getExtensionDefinition() {
    $fields = implode("\n", array_map(fn (FeedInterface $feed) => $feed->queryFieldDefinitions(), $this->getFeeds()));
    $types = implode("\n", array_map(fn (FeedInterface $feed) => $feed->typeDefinitions(), $this->getFeeds()));
    return <<<GQL
extend type Query {
  drupalFeedInfo: [Feed!]!
$fields
}

$types
GQL;
  }

  public function registerResolvers(ResolverRegistryInterface $registry) {
    $this->addFieldResolvers($registry, new ResolverBuilder());
  }

  protected function addFieldResolvers(ResolverRegistry $registry, ResolverBuilder $builder) {

    // Helpers.

    $addResolver = function(string $path, ResolverInterface $resolver) use ($registry) {
      [$type, $field] = explode('.', $path);
      $registry->addFieldResolver($type, $field, $resolver);
    };

    $addResolver('Query.drupalFeedInfo',
      $builder->fromValue(array_map(fn (FeedInterface $feed) => $feed->info(), $this->getFeeds()))
    );

    foreach($this->getFeeds() as $feed) {
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
