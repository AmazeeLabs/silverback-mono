<?php

namespace Drupal\silverback_gatsby\Commands;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\graphql_directives\Plugin\GraphQL\Schema\DirectableSchema;
use Drupal\silverback_gatsby\GatsbyBuildTriggerInterface;
use Drush\Commands\DrushCommands;
use GraphQL\Language\Printer;

/**
 * A Drush commandfile.
 *
 * In addition to this file, you need a drush.services.yml
 * in root of your module, and a composer.json file that provides the name
 * of the services file to use.
 *
 * See these files for an example of injecting Drupal services:
 *   - http://cgit.drupalcode.org/devel/tree/src/Commands/DevelCommands.php
 *   - http://cgit.drupalcode.org/devel/tree/drush.services.yml
 */
class SilverbackGatsbyCommands extends DrushCommands {

  protected EntityTypeManagerInterface $entityTypeManager;
  protected PluginManagerInterface $schemaPluginManager;
  protected GatsbyBuildTriggerInterface $buildTrigger;

  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    PluginManagerInterface $schemaPluginManager,
    GatsbyBuildTriggerInterface $buildTrigger
  ) {
    parent::__construct();
    $this->entityTypeManager = $entityTypeManager;
    $this->schemaPluginManager = $schemaPluginManager;
    $this->buildTrigger = $buildTrigger;
  }

  /**
   * Export composable schema definitions.
   *
   * @param string $folder
   *   Folder path to store the exported schema in.
   *
   * @command silverback-gatsby:schema-export
   * @aliases sgse
   */
  public function schemaExport($folder = '../generated') {
    if (!is_dir($folder)) {
      mkdir($folder, 0777, true);
    }
    $servers = $this->entityTypeManager->getStorage('graphql_server')->loadMultiple();
    foreach ($servers as $server) {
      /** @var $server \Drupal\graphql\Entity\Server */
      $config = $server->get('schema_configuration');
      /** @var \Drupal\graphql\Plugin\SchemaPluginInterface $schema */
      $schema = $this->schemaPluginManager->createInstance($server->schema, $config[$server->schema]);
      if (!$schema instanceof DirectableSchema) {
        continue;
      }
      $path = $folder . '/' . $server->id() . '.composed.graphqls';
      $this->logger->success(dt('Writing definition of %id to %path', [
        '%id' => $server->id(),
        '%path' => $path,
      ]));
      $extensions = $schema->getExtensions();
      $schemaDocument = $schema->getSchemaDocument($extensions);
      $extensionDocument = $schema->getExtensionDocument($extensions);
      file_put_contents($path, implode("\n", [
        Printer::doPrint($schemaDocument),
        Printer::doPrint($extensionDocument),
      ]));
    }
  }

  /**
   * Trigger a Gatsby build for a given GraphQL server.
   *
   * @param string $server
   *   The server id.
   *
   * @option force
   *   Force a build even if the frontend is already up-to-date.
   *
   * @command silverback-gatsby:build
   * @aliases sgb
   * @usage silverback-gatsby:build [server_id]
   */
  public function triggerBuild($server, $options = ['force' => FALSE]) {
    if ($options['force']) {
      /** @var \Drupal\silverback_gatsby\GatsbyUpdateTrackerInterface $updateTracker */
      $updateTracker = \Drupal::service('silverback_gatsby.update_tracker');
      $latestBuildId = $updateTracker->latestBuild($server);
      $this->buildTrigger->trigger($server, $latestBuildId);
    }
    else {
      $this->buildTrigger->triggerLatestBuild($server);
    }
  }

}
