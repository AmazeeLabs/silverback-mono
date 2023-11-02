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
use Drupal\graphql_directives\ConfigLoader;
use Drupal\graphql_directives\DirectableSchemaExtensionPluginBase;
use Drupal\graphql_directives\DirectiveInterpreter;
use Drupal\graphql_directives\DirectivePrinter;
use GraphQL\Language\AST\DocumentNode;
use GraphQL\Language\AST\ObjectTypeDefinitionNode;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * A directive base schema plugin.
 *
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
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
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

  /**
   * {@inheritdoc}
   */
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
  public function getSchemaDefinition(): string {
    $file = $this->configuration['schema_definition'];
    $rawSchema = FALSE;
    if (preg_match("/\.yml$/", $file)) {
      $rawSchema = ConfigLoader::loadSchema(DRUPAL_ROOT . '/' . $file);
    }
    elseif (file_exists($file)) {
      $rawSchema = file_get_contents($file);
    }
    return implode("\n", [
      $this->directivePrinter->printDirectives(),
      $rawSchema ? $rawSchema : parent::getSchemaDefinition(),
    ]);
  }

  /**
   * {@inheritdoc}
   */
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

    $autoload = [];

    if (
      array_key_exists('autoload_registry', $this->configuration) &&
      $this->configuration['autoload_registry'] &&
      file_exists($this->configuration['autoload_registry'])
    ) {
      $autoload = json_decode(file_get_contents($this->configuration['autoload_registry']), TRUE) ?? [];
    }

    $interpreter = new DirectiveInterpreter($document, $builder, $this->directiveManager, $autoload);
    $interpreter->interpret();
    foreach ($interpreter->getFieldResolvers() as $type => $fields) {
      foreach ($fields as $field => $resolver) {
        $registry->addFieldResolver($type, $field, $resolver);
      }
    }

    foreach ($interpreter->getTypeResolvers() as $type => $resolver) {
      $registry->addTypeResolver(
        $type,
        function ($value, $context, $info) use ($resolver) {
          $id = $resolver->resolve($value, [], $context, $info, new FieldContext($context, $info));
          return $this->typeMap[$id];
        });
    }
    return $registry;
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state): array {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['schema_definition'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Schema definition'),
      '#default_value' => $this->configuration['schema_definition'],
      '#description' => $this->t(
        'Path to the schema definition file. Relative to webroot.'
      ),
    ];

    $form['autoload_registry'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Autoload registry'),
      '#default_value' => $this->configuration['autoload_registry'],
      '#description' => $this->t(
        'Path to the autoload registry JSON file. Relative to webroot.'
      ),
    ];

    // Preserve config values coming from plugins (the ones that are not present on the form).
    foreach (array_keys($this->configuration) as $key) {
      if (!isset($form[$key])) {
        $form[$key] = [
          '#type' => 'value',
          '#value' => $this->configuration[$key],
        ];
      }
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getSchemaDocument(array $extensions = []): DocumentNode {
    $document = parent::getSchemaDocument($extensions);
    foreach ($extensions as $extension) {
      if ($extension instanceof DirectableSchemaExtensionPluginBase) {
        $extension->setParentAst($document);
      }
    }
    return $document;
  }

  /**
   * {@inheritdoc}
   */
  public function getExtensionDocument(array $extensions = []): ?DocumentNode {
    return parent::getExtensionDocument($extensions);
  }

  /**
   * {@inheritdoc}
   */
  public function getExtensions(): array {
    return parent::getExtensions();
  }

}
