<?php

namespace Drupal\silverback_gatsby\GraphQL;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema as OriginalComposableSchema;
use Drupal\graphql\Plugin\SchemaExtensionPluginManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Base class for composable/extensible schemas.
 *
 * TODO: Move this back into the upstream GraphQL module.
 *
 * Allows extensions to access the host schema AST and define directives
 * that can be used by the host schema.
 *
 * Grants public access to extensions so other services can interact with them.
 *
 * @package Drupal\silverback_gatsby\GraphQL
 */
class ComposableSchema extends OriginalComposableSchema {

  protected EntityTypeManagerInterface $entityTypeManager;

  public function __construct(
    array $configuration,
    $pluginId,
    array $pluginDefinition,
    CacheBackendInterface $astCache,
    ModuleHandlerInterface $moduleHandler,
    SchemaExtensionPluginManager $extensionManager,
    array $config,
    EntityTypeManagerInterface $entityTypeManager
  ) {
    parent::__construct(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $astCache,
      $moduleHandler,
      $extensionManager,
      $config
    );
    $this->entityTypeManager = $entityTypeManager;
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
      $container->getParameter('graphql.config'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function getExtensions() {
    $extensions = parent::getExtensions();

    $schema = $this->getSchemaDefinition();
    // Iterate through all extensions and pass them the current schema, so they
    // can act on it.
    foreach($extensions as $extension) {
      if ($extension instanceof ParentAwareSchemaExtensionInterface) {
        $extension->setParentSchemaDefinition($schema);
      }
    }

    return $extensions;
  }

  public function buildConfigurationForm(
    array $form,
    FormStateInterface $form_state
  ) {
    $form = parent::buildConfigurationForm(
      $form,
      $form_state
    );

    $form['build_webhook'] = [
      '#type' => 'textfield',
      '#required' => FALSE,
      '#title' => $this->t('Build webhook'),
      '#description' => $this->t('A webhook that will be notified when content changes relevant to this server happen.'),
      '#default_value' => $this->configuration['build_webhook'] ?? '',
    ];

    $form['role'] = [
      '#type' => 'select',
      '#required' => TRUE,
      '#options' => [],
      '#title' => $this->t('Notification role'),
      '#description' => $this->t('Choose a notification role. Only changes visible to that role will trigger build updates.'),
      '#default_value' => $this->configuration['role'] ?? '',
    ];
    foreach ($this->entityTypeManager->getStorage('user_role')->loadMultiple() as $id => $role) {
      if (!in_array($id, ['anonymous', 'authenticated'])) {
        $form['role']['#options'][$id] = $role->label();
      }
    }
    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function getSchemaDefinition() {
    $extensions = parent::getExtensions();

    // Get all extensions and prepend any defined directives to the schema.
    $schema = [];
    foreach ($extensions as $extension) {
      if ($extension instanceof DirectiveProviderExtensionInterface) {
        $schema[] = $extension->getDirectiveDefinitions();
      }
    }

    // Attempt to load a schema file and return it instead of the hardcoded
    // empty schema in \Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema.
    $id = $this->getPluginId();
    $definition = $this->getPluginDefinition();
    $module = $this->moduleHandler->getModule($definition['provider']);
    $path = 'graphql/' . $id . '.graphqls';
    $file = $module->getPath() . '/' . $path;

    if (!file_exists($file)) {
      return parent::getSchemaDefinition();
    }

    $schema[] = file_get_contents($file);

    return implode("\n", $schema);
  }
}
