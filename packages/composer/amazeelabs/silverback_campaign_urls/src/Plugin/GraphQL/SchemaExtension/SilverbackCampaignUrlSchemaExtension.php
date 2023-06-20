<?php

namespace Drupal\silverback_campaign_urls\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Schema extension plugin that exposes the campaign URLs.
 *
 * @SchemaExtension(
 *   id = "silverback_campaign_urls",
 *   name = "Silverback Campaign URLs",
 *   description = "Schema extension exposing the campaign URLs."
 * )
 */
class SilverbackCampaignUrlSchemaExtension extends SdlSchemaExtensionPluginBase {

  /**
   * @param ResolverRegistryInterface $registry
   * @return void
   */
  public function registerResolvers(ResolverRegistryInterface $registry) {
    // No special resolvers to register yet, all the campaign URL fields
    // defined in the extension base graphqls file are resolved using
    // directives.
  }
}
