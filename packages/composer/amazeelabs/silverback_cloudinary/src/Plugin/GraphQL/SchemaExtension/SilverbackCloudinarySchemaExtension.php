<?php

namespace Drupal\silverback_cloudinary\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * @SchemaExtension(
 *   id = "silverback_cloudinary",
 *   name = "Silverback Cloudinary",
 *   description = "Schema extension to add the cloudinary fields.",
 * )
 */
class SilverbackCloudinarySchemaExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritDoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry) {
    $builder = new ResolverBuilder();
    $registry->addFieldResolver('Query', 'heroImage',
      $builder->produce('responsive_image')
      ->map('image', $builder->fromValue('https://cms.nuklearforum.ch/sites/default/files/2022-12/Weihnachtsbild.jpg'))
      ->map('config', $builder->fromArgument('config'))
    );
  }
}
