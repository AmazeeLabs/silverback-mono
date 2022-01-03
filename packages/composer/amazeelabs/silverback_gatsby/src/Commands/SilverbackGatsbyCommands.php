<?php

namespace Drupal\silverback_gatsby\Commands;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\silverback_gatsby\GraphQL\ComposableSchema;
use Drush\Commands\DrushCommands;

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

  public function __construct(EntityTypeManagerInterface $entityTypeManager, PluginManagerInterface $schemaPluginManager) {
    parent::__construct();
    $this->entityTypeManager = $entityTypeManager;
    $this->schemaPluginManager = $schemaPluginManager;
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
      if (!$schema instanceof ComposableSchema) {
        continue;
      }
      $path = $folder . '/' . $server->id() . '.composed.graphqls';
      $this->logger->success(dt('Writing definition of %id to %path', [
        '%id' => $server->id(),
        '%path' => $path,
      ]));
      $definition = [$schema->getSchemaDefinition()];
      foreach ($schema->getExtensions() as $extension) {
        $definition[] = $extension->getBaseDefinition();
        $definition[] = $extension->getExtensionDefinition();
      }
      file_put_contents($path, implode("\n", $definition));
    }
  }
}
