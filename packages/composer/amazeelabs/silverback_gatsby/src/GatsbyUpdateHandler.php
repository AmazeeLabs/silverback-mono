<?php

namespace Drupal\silverback_gatsby;

use Drupal\Component\Plugin\ConfigurableInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\silverback_gatsby\GraphQL\ComposableSchema;
use Drupal\silverback_gatsby\Plugin\GraphQL\SchemaExtension\SilverbackGatsbySchemaExtension;

/**
 * Class GatsbyUpdateHandler
 *
 * Handle update events from different sources, process and distribute them.
 *
 * @package Drupal\silverback_gatsby
 */
class GatsbyUpdateHandler {

  protected EntityTypeManagerInterface $entityTypeManager;
  protected GatsbyUpdateTracker $gatsbyUpdateTracker;

  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    GatsbyUpdateTracker $gatsbyUpdateTracker
  ) {
    $this->entityTypeManager = $entityTypeManager;
    $this->gatsbyUpdateTracker = $gatsbyUpdateTracker;
  }

  /**
   * Handle an update event.
   *
   * @param string $feedClassName
   *   The feed class name.
   * @param $context
   *   The context value.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \GraphQL\Error\SyntaxError
   */
  public function handle(string $feedClassName, $context) {
    /** @var \Drupal\graphql\Entity\ServerInterface[] $servers */
    $servers = $this->entityTypeManager
      ->getStorage('graphql_server')
      ->loadMultiple();

    $manager = \Drupal::service('plugin.manager.graphql.schema');

    /** @var \Drupal\graphql\Plugin\SchemaPluginInterface $plugin */
    foreach($servers as  $server) {
      $schema_id = $server->get('schema');
      $schema = $manager->createInstance($schema_id);
      if ($schema instanceof ComposableSchema &&  $config = $server->get('schema_configuration')) {
        $schema->setConfiguration($config[$schema_id] ?? []);
        foreach ($schema->getExtensions() as $extension) {
          if ($extension instanceof SilverbackGatsbySchemaExtension) {
            foreach ($extension->getFeeds() as $feed) {
              if (
                $feed instanceof $feedClassName
                && $updates = $feed->investigateUpdate($context)
              ) {
                foreach ($updates as $update) {
                  $this->gatsbyUpdateTracker->track($server->id(), $update->type, $update->id);
                }
              }
            }
          }
        }
      }
    }
  }

}
