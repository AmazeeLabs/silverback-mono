<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Schema;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema;
use Drupal\graphql\Plugin\SchemaExtensionPluginManager;
use Drupal\graphql_directives\DirectableSchemaExtensionPluginBase;
use Drupal\graphql_directives\DirectiveInterpreter;
use Drupal\graphql_directives\DirectivePrinter;
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
  protected $typeMap = [];
  protected $typeResolvers = [];

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
  public function getSchemaDefinition() {
    $file = $this->configuration['schema_definition'];
    return implode("\n", [
      $this->directivePrinter->printDirectives(),
      file_exists($file) ? file_get_contents($file) : parent::getSchemaDefinition(),
    ]);
  }

  public function getResolverRegistry() {
    $registry = new ResolverRegistry();
    $extensions = $this->getExtensions();
    $builder = new ResolverBuilder();
    $document = $this->getSchemaDocument($extensions);

    foreach ($document->definitions as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        foreach ($definition->directives as $directive) {
          if ($directive->name->value === 'type' && $directive->arguments) {
            foreach ($directive->arguments as $argument) {
              if ($argument->name->value === 'id') {
                $this->typeMap[$argument->value->value] = $definition->name->value;
              }
            }
          }
        }
      }
    }

    $interpreter = new DirectiveInterpreter($document, $builder, $this->directiveManager);
    $interpreter->interpret();
    foreach($interpreter->getFieldResolvers() as $type => $fields) {
      foreach($fields as $field => $resolver) {
        $registry->addFieldResolver($type, $field, $resolver);
      }
    }

    foreach($interpreter->getTypeResolvers() as $type => $resolver) {
      $registry->addTypeResolver(
        $type,
        function ($value, $context, $info) use ($resolver) {
          $id = $resolver->resolve($value, [], $context, $info, new FieldContext($context, $info));
          return $this->typeMap[$id];
        });
    }
    return $registry;
  }

  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $extensions = $this->extensionManager->getDefinitions();

    $form[$this->pluginId]['extensions'] = [
      '#type' => 'checkboxes',
      '#required' => FALSE,
      '#title' => $this->t('Enabled extensions'),
      '#options' => [],
      '#default_value' => $this->configuration[$this->pluginId]['extensions'] ?? [],
    ];

    foreach ($extensions as $key => $extension) {
      $form[$this->pluginId]['extensions']['#options'][$key] = $extension['name'] ?? $extension['id'];

      if (!empty($extension['description'])) {
        $form[$this->pluginId]['extensions'][$key]['#description'] = $extension['description'];
      }
    }
    $form[$this->pluginId]['schema_definition'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Schema definition'),
      '#default_value' => $this->configuration[$this->pluginId]['schema_definition'],
      '#description' => $this->t(
        'Path to the schema definition file. Relative to webroot.'
      ),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getSchemaDocument(array $extensions = []) {
    $document = parent::getSchemaDocument($extensions);
    foreach($extensions as $extension) {
      if ($extension instanceof DirectableSchemaExtensionPluginBase) {
        $extension->setParentAst($document);
      }
    }
    return $document;
  }

  /**
   * {@inheritdoc}
   */
  public function getExtensionDocument(array $extensions = []) {
    return parent::getExtensionDocument($extensions);
  }

  /**
   * {@inheritdoc}
   */
  public function getExtensions() {
    return parent::getExtensions();
  }

}
