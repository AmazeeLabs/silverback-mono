<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\silverback_gatsby\GraphQL\ComposableSchema;
use Drupal\silverback_gatsby\Plugin\GraphQL\SchemaExtension\SilverbackGatsbySchemaExtension;
use Drupal\user\Entity\User;

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
        if (!isset($config[$schema_id]['build_webhook'])) {
          continue;
        }
        $schema->setConfiguration($config[$schema_id] ?? []);

        if ($config[$schema_id]['user'] ?? NULL) {
          $accounts = $this->entityTypeManager->getStorage('user')->loadByProperties(['uuid' => $config[$schema_id]['user']]);
          $account = reset($accounts);
          if (!$account) {
            if (!getenv('SB_SETUP')) {
              \Drupal::messenger()->addError("The website won't be rebuilt because of a misconfigured GraphQL server (missing user)");
              \Drupal::logger('silverback_gatsby')->error('Cannot load user "{user}" configured in server "{server}".', [
                'user' => $config[$schema_id]['user'],
                'server' => $server->id(),
              ]);
            }
            return;
          }
        }
        else {
          // This is deprecated. It causes issues with the domain module:
          // https://github.com/AmazeeLabs/silverback-mono/issues/928
          $account = User::create();
          if (isset($config[$schema_id]['role'])) {
            $account->addRole($config[$schema_id]['role']);
          }
        }

        // If the configuration is not set, assume TRUE.
        $trigger = TRUE;
        if (array_key_exists('build_trigger_on_save', $config[$schema_id])) {
          $trigger = $config[$schema_id]['build_trigger_on_save'] === 1;
        }
        foreach ($schema->getExtensions() as $extension) {
          if ($extension instanceof SilverbackGatsbySchemaExtension) {
            foreach ($extension->getFeeds() as $feed) {
              if (
                $feed instanceof $feedClassName
                && $updates = $feed->investigateUpdate($context, $account)
              ) {
                foreach ($updates as $update) {
                  $this->gatsbyUpdateTracker->track($server->id(), $update->type, $update->id, $trigger);
                }
              }
            }
          }
        }
      }
    }
  }

}
