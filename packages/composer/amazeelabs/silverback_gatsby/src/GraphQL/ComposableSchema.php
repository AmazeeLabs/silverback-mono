<?php

namespace Drupal\silverback_gatsby\GraphQL;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\graphql\Plugin\SchemaExtensionPluginManager;
use Drupal\graphql_directives\DirectivePrinter;
use Drupal\graphql_directives\Plugin\GraphQL\Schema\DirectableSchema;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @deprecated Use \Drupal\graphql_directives\Plugin\GraphQL\Schema\DirectableSchema instead.
 *
 * @package Drupal\silverback_gatsby\GraphQL
 */
class ComposableSchema extends DirectableSchema {

  protected EntityTypeManagerInterface $entityTypeManager;
  protected RouteMatchInterface $routeMatch;

  public function __construct(
    array $configuration,
    $pluginId,
    array $pluginDefinition,
    CacheBackendInterface $astCache,
    ModuleHandlerInterface $moduleHandler,
    SchemaExtensionPluginManager $extensionManager,
    ?PluginManagerInterface $directiveManager,
    ?DirectivePrinter $directivePrinter,
    EntityTypeManagerInterface $entityTypeManager,
    RouteMatchInterface $routeMatch,
    array $config
  ) {
    parent::__construct(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $astCache,
      $moduleHandler,
      $extensionManager,
      $directiveManager,
      $directivePrinter,
      $config,
    );
    $this->entityTypeManager = $entityTypeManager;
    $this->routeMatch = $routeMatch;
  }

  public static function create(
    ContainerInterface $container,
    array $configuration,
    $plugin_id,
    $plugin_definition
  ) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cache.graphql.ast'),
      $container->get('module_handler'),
      $container->get('plugin.manager.graphql.schema_extension'),
      $container->get('graphql_directives.manager'),
      $container->get('graphql_directives.printer'),
      $container->get('entity_type.manager'),
      $container->get('current_route_match'),
      $container->getParameter('graphql.config')
    );
  }
}
