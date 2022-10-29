<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Schema;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema;
use Drupal\graphql\Plugin\SchemaExtensionPluginManager;
use Drupal\graphql_directives\DirectivePrinter;
use GraphQL\Language\AST\NodeList;
use GraphQL\Language\AST\ObjectTypeDefinitionNode;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @Schema(
 *   id = "directable",
 *   name = "Directable schema"
 * )
 */
class DirectableSchema extends ComposableSchema {

  protected PluginManagerInterface $directiveManager;
  protected DirectivePrinter $directivePrinter;

  /**
   * {@inheritdoc}
   *
   * @codeCoverageIgnore
   */
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
      $container->getParameter('graphql.config')
    );
  }

  public function __construct(
    array $configuration,
    $pluginId,
    array $pluginDefinition,
    ?CacheBackendInterface $astCache,
    ?ModuleHandlerInterface $moduleHandler,
    ?SchemaExtensionPluginManager $extensionManager,
    ?PluginManagerInterface $directiveManager,
    ?DirectivePrinter $directivePrinter,
    array $config
  ) {
    $this->directiveManager = $directiveManager;
    $this->directivePrinter = $directivePrinter;

    parent::__construct(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $astCache,
      $moduleHandler,
      $extensionManager,
      $config
    );
  }

  /**
   * Retrieves the raw schema definition string.
   *
   * @return string
   *   The schema definition.
   *
   * @throws \Exception
   */
  protected function getSchemaDefinition() {
    $file = $this->configuration['schema_definition'];
    if (!file_exists($file)) {
      throw new \Exception(sprintf('Schema definition file %s does not exist.', $file));
    }

    return implode("\n", [
      $this->directivePrinter->printDirectives(),
      file_get_contents($file),
    ]);
  }

  /**
   * @param ?\GraphQL\Language\AST\NodeList $arguments
   *
   * @return array
   */
  protected function argumentsToParameters(?NodeList $arguments): array {
    $config = [];
    if ($arguments) {
      foreach ($arguments as $argument) {
        $config[$argument->name->value] = $argument->value->value;
      }
    }
    return $config;
  }

  public function getResolverRegistry() {
    $registry = new ResolverRegistry();
    $extensions = $this->getExtensions();
    $builder = new ResolverBuilder();
    $document = $this->getSchemaDocument($extensions);

    foreach ($document->definitions as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        foreach($definition->fields as $field) {
          if ($field->directives) {
            foreach ($field->directives as $directive) {
              if ($this->directiveManager->hasDefinition($directive->name->value)) {
                $plugin = $this->directiveManager
                  ->createInstance($directive->name->value);
                $parameters = $this->argumentsToParameters($directive->arguments);

                $registry->addFieldResolver(
                  $definition->name->value,
                  $field->name->value,
                  $plugin->buildResolver(
                    $builder,
                    $parameters
                  )
                );
              }
            }
          }
        }
      }
    }
    return $registry;
  }

  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['schema_definition'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Schema definition'),
      '#default_value' => $this->configuration['schema_definition'],
      '#description' => $this->t(
        'Path to the schema definition file. Relative to webroot.'
      ),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'schema_definition' => 'schema.graphqls',
      'extensions' => [],
    ];
  }

}
