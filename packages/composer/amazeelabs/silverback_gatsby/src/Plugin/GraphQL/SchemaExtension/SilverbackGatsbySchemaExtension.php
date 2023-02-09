<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\SchemaExtension;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql_directives\DirectableSchemaExtensionPluginBase;
use Drupal\silverback_gatsby\Plugin\FeedInterface;
use GraphQL\Language\AST\DocumentNode;
use GraphQL\Language\AST\ListValueNode;
use GraphQL\Language\AST\ObjectTypeDefinitionNode;
use GraphQL\Language\AST\StringValueNode;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Schema extension plugin that prepares any schema to be consumed by Gatsby.
 *
 * @SchemaExtension(
 *   id = "silverback_gatsby",
 *   name = "Silverback Gatsby",
 *   description = "Schema extension providing default resolvers for Gatsby."
 * )
 */
class SilverbackGatsbySchemaExtension extends DirectableSchemaExtensionPluginBase {

  /**
   * The list of feeds that are used by the parent schema.
   *
   * @var array
   */
  protected array $feeds = [];

  /**
   * The list of fields marked with "resolve*" directives.
   *
   * @var array
   *   Keys are GraphQL paths, values are directive names and arguments.
   *   Example:
   *   [
   *     'Page.path' => [
   *       'name' => 'resolvePath',
   *       'arguments' => [],
   *     ],
   *     'Page.title' => [
   *       'name' => 'resolveProperty',
   *       'arguments' => ['path' => 'title.value'],
   *     ]
   *   ]
   */
  protected array $resolvers;

  /**
   * @var \Drupal\Core\Plugin\DefaultPluginManager|object|null
   */
  protected $feedManager;

  /**
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;


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
      $container->get('module_handler'),
      $container->get('silverback_gatsby.feed_manager'),
      $container->get('logger.factory')->get('silverback_gatsby'),
    );
  }

  /**
   * {@inheritDoc}
   */
  public function __construct(
    array $configuration,
    $pluginId,
    array $pluginDefinition,
    ModuleHandlerInterface $moduleHandler,
    PluginManagerInterface $feedManager,
    LoggerInterface $logger
  ) {
    parent::__construct(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $moduleHandler,
    );
    $this->feedManager = $feedManager;
    $this->logger = $logger;
  }

  /**
   * {@inheritDoc}
   */
  public function getDirectiveDefinitions(): string {
    $feeds = $this->feedManager->getDefinitions();
    uasort($feeds, fn ($a, $b) => strnatcasecmp($a['id'], $b['id']));
    $directives = array_map(fn ($def) => $def['directive'], $feeds);

    $module = \Drupal::moduleHandler()->getModule('silverback_gatsby');
    $path = 'graphql/editor_block.directive.graphqls';
    $file = $module->getPath() . '/' . $path;
    $directives[] = file_get_contents($file);
    return implode("\n", $directives);
  }

  /**
   * Retrieve all feeds that are referenced in the host schema.
   *
   * @return \Drupal\silverback_gatsby\Plugin\FeedInterface[]
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function getFeeds(DocumentNode $ast): array {
    if (count($this->feeds) === 0) {
      // Search for object type definitions ...
      foreach ($ast->definitions->getIterator() as $definition) {
        // ... that have directives.
        if ($definition instanceof ObjectTypeDefinitionNode && $definition->directives) {
          // Create feed instances for all directives that are know to the
          // feed manager.
          foreach ($definition->directives->getIterator() as $directive) {
            /** @var \GraphQL\Language\AST\DirectiveNode $directive */
            $id = $directive->name->value;
            if (!$this->feedManager->hasDefinition($id)) {
              continue;
            }

            // Collect the type name.
            $config = [
              'typeName' => $definition->name->value,
            ];

            // Collect the directive arguments.
            foreach ($directive->arguments->getIterator() as $arg) {
              /** @var \GraphQL\Language\AST\ArgumentNode $arg */
              if ($arg->value instanceof ListValueNode) {
                // If it's a list value, turn it into an array of values.
                $config[$arg->name->value] = [];
                for($i = 0; $i < $arg->value->values->count(); $i++) {
                  if ($arg->value->values[$i] instanceof StringValueNode) {
                    $config[$arg->name->value][] = $arg->value->values[$i]->value;
                  }
                }
              }
              else {
                $config[$arg->name->value] = $arg->value->value;
              }
            }

            // Collect the field directives.
            /** @var \GraphQL\Language\AST\FieldDefinitionNode $field */
            foreach ($definition->fields as $field) {
              foreach ($field->directives as $fieldDirective) {

                // Directives used for automatic page creation.
                if (in_array($fieldDirective->name->value, ['isPath', 'path'], TRUE)) {
                  $config['createPageFields']['isPath'] = $field->name->value;
                }
                if (in_array($fieldDirective->name->value, ['isTemplate', 'template'], TRUE)) {
                  $config['createPageFields']['isTemplate'] = $field->name->value;
                }
              }
            }

            $this->feeds[] = $this->feedManager->createInstance($id, $config);
          }
        }
      }
    }
    return $this->feeds;
  }

  /**
   * Build the automatic schema definition for a given Feed.
   */
  protected function getSchemaDefinitions(DocumentNode $ast, FeedInterface $feed) : string {
    $typeName = $feed->getTypeName();
    $singleFieldName = $feed->getSingleFieldName();
    $listFieldName = $feed->getListFieldName();
    $schema = [
      "extend type Query {",
      "  $singleFieldName(id: String!): $typeName",
      "  $listFieldName(offset: Int, limit: Int): [$typeName]!",
    ];

    $schema [] = "}";

    if ($feed->isTranslatable()) {
      $schema[] = "extend type $typeName {";
      $schema[] = "  id: String!";
      $schema[] = "  drupalId: String!";
      $schema[] = "  defaultTranslation: Boolean!";
      $schema[] = "  langcode: String!";
      $schema[] = "  translations: [$typeName!]!";
      $schema[] = "}";
    }
    else {
      $schema[] = "extend type $typeName {";
      $schema[] = "  id: String!";
      $schema[] = "  drupalId: String!";
      $schema[] = "}";
    }

    $schema[] = $feed->getExtensionDefinition($ast);

    return implode("\n", $schema);
  }

  protected function getDirectableExtensionDefinition(DocumentNode $ast): string {
    // Collect all active feeds and prepend their definitions to the schema.
    $schema = array_map(fn (FeedInterface $feed) => $this->getSchemaDefinitions($ast, $feed), $this->getFeeds($ast));
    array_unshift($schema, $this->getOriginalTypenameDefinitions($ast));
    return implode("\n", $schema);
  }

  protected function registerDirectableResolvers(DocumentNode $ast, ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();
    $this->addFieldResolvers($ast, $registry, $builder);
    $this->addOriginalTypenameResolvers($ast, $registry, $builder);
  }


  /**
   * Attach a _original_typename field to every type.
   *
   * To preserve the original type in cases where the types are namespaced and
   * merged into a different graphql schema (e.g. Gatsby).
   *
   * @return string
   */
  protected function getOriginalTypenameDefinitions(DocumentNode $ast): string {
    $types = [];
    foreach ($ast->definitions->getIterator() as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        $name = $definition->name->value;
        $types[] = "extend type {$name} { _original_typename: String! }";
      }
    }
    return implode("\n", $types);
  }

  /**
   * Attach a _original_typename resolvers.
   *
   * @return void
   */
  protected function addOriginalTypenameResolvers(DocumentNode $ast, ResolverRegistry $registry, ResolverBuilder $builder) {
    foreach ($ast->definitions->getIterator() as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        $registry->addFieldResolver($definition->name->value, '_original_typename', $builder->fromValue($definition->name->value));
      }
    }
  }

  /**
   * Implement field resolvers for this extension.
   */
  protected function addFieldResolvers(DocumentNode $ast, ResolverRegistry $registry, ResolverBuilder $builder) {

    $registry->addFieldResolver(
      'Query',
      'drupalFeedInfo',
      $builder->fromValue(array_map(fn (FeedInterface $feed) => $feed->info(), $this->getFeeds($ast)))
    );
    $registry->addFieldResolver(
      'Query',
      'drupalBuildId',
      $builder->callback(function ($value, $args, ResolveContext $context) {
        // Make sure this is never cached.
        $context->mergeCacheMaxAge(0);
        /** @var \Drupal\silverback_gatsby\GatsbyUpdateTrackerInterface $tracker */
        $tracker = \Drupal::service('silverback_gatsby.update_tracker');
        return $tracker->latestBuild($context->getServer()->id());
      })
    );

    $registry->addFieldResolver('Feed', 'changes', $builder->callback(function ($value, $args, ResolveContext $context) {
      // Make sure this is never cached.
      $context->mergeCacheMaxAge(0);
      /** @var \Drupal\silverback_gatsby\GatsbyUpdateTrackerInterface $tracker */
      $tracker = \Drupal::service('silverback_gatsby.update_tracker');
      return array_map(fn ($change) => $change->id, array_filter(
        isset($args['lastBuild']) && isset($args['currentBuild'])
          ? $tracker->diff($args['lastBuild'], $args['currentBuild'], $context->getServer()->id())
          : [],
        fn ($change) => $change->type === $value['typeName']
      ));
    }));

    foreach($this->getFeeds($ast) as $feed) {

      $idResolver = $feed->resolveId();
      $langcodeResolver = $feed->resolveLangcode();

      $registry->addFieldResolver('Query', $feed->getListFieldName(), $feed->resolveItems(
        $builder->fromArgument('limit'),
        $builder->fromArgument('offset'),
      ));

      $typeName = $feed->getTypeName();
      $registry->addFieldResolver($typeName, 'drupalId', $idResolver);
      $feed->addExtensionResolvers($registry, $builder);

      if ($feed->isTranslatable()) {
        $registry->addFieldResolver('Query', $feed->getSingleFieldName(), $feed->resolveItem(
          $builder->produce('gatsby_extract_id')
            ->map('id', $builder->fromArgument('id')),
          $builder->produce('gatsby_extract_langcode')
            ->map('id', $builder->fromArgument('id')),
        ));

        $registry->addFieldResolver($typeName, 'id',
          $builder->produce('gatsby_build_id')
            ->map('id', $idResolver)
            ->map('langcode', $langcodeResolver)
        );

        $registry->addFieldResolver($typeName, 'langcode', $langcodeResolver);
        $registry->addFieldResolver($typeName, 'defaultTranslation', $feed->resolveDefaultTranslation());
        $registry->addFieldResolver($typeName, 'translations', $feed->resolveTranslations());
      }
      else {
        $registry->addFieldResolver('Query', $feed->getSingleFieldName(), $feed->resolveItem(
          $builder->fromArgument('id'))
        );

        $registry->addFieldResolver($typeName, 'id', $idResolver);
      }
    }

    $addResolver = function(string $path, ResolverInterface $resolver) use ($registry) {
      [$type, $field] = explode('.', $path);
      $registry->addFieldResolver($type, $field, $resolver);
    };

    $currentUser = $builder->produce('current_user_entity');
    $addResolver('Query.currentUser', $currentUser);

    $entityId = $builder->produce('entity_id')->map('entity', $builder->fromParent());
    $entityLabel = $builder->callback(fn(EntityInterface $value) => $value->label());
    $addResolver('User.id', $entityId);
    $addResolver('User.name', $entityLabel);
  }

}
