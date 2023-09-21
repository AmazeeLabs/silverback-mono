<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\graphql_directives\Plugin\GraphQL\Schema\DirectableSchema;
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

  /**
   * @var array<array{
   *    account: \Drupal\user\UserInterface,
   *    feeds: array<\Drupal\silverback_gatsby\Plugin\FeedInterface>,
   *    serverId: string,
   *    trigger: bool
   *  }>|null
   * @internal
   */
  public ?array $schemaCache = NULL;

  protected EntityTypeManagerInterface $entityTypeManager;
  protected GatsbyUpdateTrackerInterface $gatsbyUpdateTracker;
  protected GatsbyUpdateTriggerInterface $gatsbyUpdateTrigger;

  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    GatsbyUpdateTrackerInterface $gatsbyUpdateTracker,
    GatsbyUpdateTriggerInterface $gatsbyUpdateTrigger
  ) {
    $this->entityTypeManager = $entityTypeManager;
    $this->gatsbyUpdateTracker = $gatsbyUpdateTracker;
    $this->gatsbyUpdateTrigger = $gatsbyUpdateTrigger;
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
    foreach ($this->getSchemas() as $schema) {
      foreach ($schema['feeds'] as $feed) {
        if (
          $feed instanceof $feedClassName
        ) {
          // Updates for the actual build. They should respect access
          // permissions of the configured account.
          if ($updates = $feed->investigateUpdate($context, $schema['account'])) {
            foreach ($updates as $update) {
              $this->gatsbyUpdateTracker->track(
                $schema['serverId'],
                $update->type,
                $update->id,
                $schema['trigger'],
              );
            }
          }
          // Preview change notifications should always go through.
          if ($changes = $feed->investigateUpdate($context, null)) {
            foreach ($changes as $change) {
              $this->gatsbyUpdateTrigger->trigger(
                $schema['serverId'],
                $change
              );
            }
          }
        }
      }
    }
  }

  /**
   * @return array<array{
   *   account: \Drupal\user\UserInterface,
   *   feeds: array<\Drupal\silverback_gatsby\Plugin\FeedInterface>,
   *   serverId: string,
   *   trigger: bool
   * }>|null
   */
  protected function getSchemas(): array {
    if ($this->schemaCache !== NULL) {
      return $this->schemaCache;
    }
    $this->schemaCache = [];

    /** @var \Drupal\graphql\Entity\ServerInterface[] $servers */
    $servers = $this->entityTypeManager
      ->getStorage('graphql_server')
      ->loadMultiple();

    $manager = \Drupal::service('plugin.manager.graphql.schema');

    /** @var \Drupal\graphql\Plugin\SchemaPluginInterface $plugin */
    foreach($servers as  $server) {
      $schema_id = $server->get('schema');
      $schema = $manager->createInstance($schema_id);
      if ($schema instanceof DirectableSchema && $config = $server->get('schema_configuration')) {
        if (!isset($config[$schema_id]['build_webhook'])) {
          continue;
        }
        $schema->setConfiguration($config[$schema_id] ?? []);

        /**
         * @var array{
         *   account: \Drupal\user\UserInterface,
         *   feeds: array<\Drupal\silverback_gatsby\Plugin\FeedInterface>,
         *   serverId: string,
         *   trigger: bool
         * } $item
         * */
        $item = [];

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
            return $this->schemaCache;
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
        $item['account'] = $account;

        $item['serverId'] = $server->id();

        // If the configuration is not set, assume TRUE.
        $trigger = TRUE;
        if (array_key_exists('build_trigger_on_save', $config[$schema_id])) {
          $trigger = $config[$schema_id]['build_trigger_on_save'] === 1;
        }
        $item['trigger'] = $trigger;

        $item['feeds'] = [];
        $extensions = $schema->getExtensions();
        $ast = $schema->getSchemaDocument($extensions);
        foreach ($extensions as $extension) {
          if ($extension instanceof SilverbackGatsbySchemaExtension) {
            foreach ($extension->getFeeds($ast) as $feed) {
              $item['feeds'][] = $feed;
            }
          }
        }

        $this->schemaCache[] = $item;
      }
    }

    return $this->schemaCache;
  }

}
