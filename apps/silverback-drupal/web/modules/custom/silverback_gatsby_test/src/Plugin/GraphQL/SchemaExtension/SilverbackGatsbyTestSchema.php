<?php
namespace Drupal\silverback_gatsby_test\Plugin\GraphQL\SchemaExtension;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * @SchemaExtension(
 *   id = "silverback_gatsby_test",
 *   name = "Silverback example schema",
 *   description = "Example schema based on silverback_gatsby.",
 *   schema = "silverback_gatsby"
 * )
 */
class SilverbackGatsbyTestSchema extends SdlSchemaExtensionPluginBase {

  public function registerResolvers(ResolverRegistryInterface $registry) {
    // TODO: Implement registerResolvers() method.
  }

}
