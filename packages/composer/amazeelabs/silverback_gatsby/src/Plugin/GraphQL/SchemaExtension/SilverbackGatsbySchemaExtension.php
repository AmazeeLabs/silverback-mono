<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\SchemaExtension;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Menu\MenuLinkTreeElement;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Drupal\silverback_gatsby\GraphQL\DirectiveProviderExtensionInterface;
use Drupal\silverback_gatsby\GraphQL\ParentAwareSchemaExtensionInterface;
use Drupal\silverback_gatsby\Plugin\FeedInterface;
use Drupal\silverback_gatsby\Plugin\Gatsby\Feed\MenuFeed;
use Drupal\typed_data\Exception\LogicException;
use GraphQL\Language\AST\DocumentNode;
use GraphQL\Language\AST\ListValueNode;
use GraphQL\Language\AST\ObjectTypeDefinitionNode;
use GraphQL\Language\AST\StringValueNode;
use GraphQL\Language\AST\UnionTypeDefinitionNode;
use GraphQL\Language\Parser;
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
class SilverbackGatsbySchemaExtension extends SdlSchemaExtensionPluginBase
  implements ParentAwareSchemaExtensionInterface, DirectiveProviderExtensionInterface {

  /**
   * The parent schema's AST.
   *
   * @var \GraphQL\Language\AST\DocumentNode
   */
  protected DocumentNode $parentAst;

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
   *
   * @throws \GraphQL\Error\SyntaxError
   */
  public function setParentSchemaDefinition(string $definition) {
    $this->parentAst = Parser::parse($definition);
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
  public function getFeeds(): array {
    if (count($this->feeds) === 0) {
      // Search for object type definitions ...
      foreach ($this->parentAst->definitions->getIterator() as $definition) {
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
   * @see SilverbackGatsbySchemaExtension::$resolvers
   */
  protected function getResolveDirectives(): array {
    if (isset($this->resolvers)) {
      return $this->resolvers;
    }
    $this->resolvers = [];
    foreach ($this->parentAst->definitions->getIterator() as $definition) {
      if (!($definition instanceof ObjectTypeDefinitionNode)) {
        continue;
      }
      foreach ($definition->fields as $field) {
        foreach ($field->directives as $fieldDirective) {
          $list = [
            'resolveEntityPath',
            'resolveProperty',
            'property',
            'resolveEntityReference',
            'resolveEntityReferenceRevisions',
            'resolveMenuItems',
            'resolveMenuItemId',
            'resolveMenuItemParentId',
            'resolveMenuItemLabel',
            'resolveMenuItemUrl',
            'resolveEditorBlocks',
            'resolveEditorBlockAttribute'
          ];
          if (in_array($fieldDirective->name->value, $list, TRUE)) {
            $graphQlPath = $definition->name->value . '.' . $field->name->value;
            $name = $fieldDirective->name->value === 'property'
              ? 'resolveProperty'
              : $fieldDirective->name->value;
            $this->resolvers[$graphQlPath] = [
              'name' => $name,
              'arguments' => [],
            ];
            foreach ($fieldDirective->arguments->getIterator() as $arg) {
              /** @var \GraphQL\Language\AST\ArgumentNode $arg */
              if ($arg->value instanceof ListValueNode) {
                $this->resolvers[$graphQlPath]['arguments'][$arg->name->value] = [];
                foreach ($arg->value->values->getIterator() as $value) {
                  if ($value instanceof StringValueNode) {
                    $this->resolvers[$graphQlPath]['arguments'][$arg->name->value][] = $value->value;
                  }
                }
              }
              else {
                $this->resolvers[$graphQlPath]['arguments'][$arg->name->value] = $arg->value->value;
              }
            }
          }
        }
      }
    }
    return $this->resolvers;
  }

  /**
   * Build the automatic schema definition for a given Feed.
   */
  protected function getSchemaDefinitions(FeedInterface $feed) : string {
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

    $schema[] = $feed->getExtensionDefinition($this->parentAst);

    return implode("\n", $schema);
  }

  /**
   * {@inheritDoc}
   */
  public function getExtensionDefinition() {
    // Collect all active feeds and prepend their definitions to the schema.
    $schema = array_map(fn (FeedInterface $feed) => $this->getSchemaDefinitions($feed), $this->getFeeds());
    array_unshift($schema, parent::getExtensionDefinition());
    array_unshift($schema, $this->getOriginalTypenameDefinitions());
    return implode("\n", $schema);
  }

  /**
   * {@inheritDoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry) {
    $builder = new ResolverBuilder();
    $this->addFieldResolvers($registry, $builder);
    $this->addTypeResolvers($registry, $builder);
    $this->addOriginalTypenameResolvers($registry, $builder);
  }

  /**
   * Attach a _original_typename field to every type.
   *
   * To preserve the original type in cases where the types are namespaced and
   * merged into a different graphql schema (e.g. Gatsby).
   *
   * @return string
   */
  protected function getOriginalTypenameDefinitions() {
    $types = [];
    foreach ($this->parentAst->definitions->getIterator() as $definition) {
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
  protected function addOriginalTypenameResolvers(ResolverRegistry $registry, ResolverBuilder $builder) {
    foreach ($this->parentAst->definitions->getIterator() as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        $registry->addFieldResolver($definition->name->value, '_original_typename', $builder->fromValue($definition->name->value));
      }
    }
  }

  /**
   * Collect and build type resolvers from the AST.
   *
   * @param \Drupal\graphql\GraphQL\ResolverRegistry $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   *
   * @return void
   */
  protected function addTypeResolvers(ResolverRegistry $registry, ResolverBuilder $builder) {
    $editorBlockTypes = [];
    foreach ($this->parentAst->definitions->getIterator() as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode && $definition->directives) {
        foreach($definition->directives->getIterator() as $directive) {
          if ($directive->name->value === 'editorBlock') {
            foreach ($directive->arguments->getIterator() as $argument) {
              if ($argument->name->value === 'type') {
                $editorBlockTypes[$definition->name->value] = $argument->value->value;
              }
            }
          }
        }
      }
    }

    $editorBlockUnions = [];

    foreach ($this->parentAst->definitions->getIterator() as $definition) {
      if ($definition instanceof UnionTypeDefinitionNode) {
        $union = $definition->name->value;
        $editorBlockUnions[$union] = [];
        $unionTypes = [];
        foreach ($definition->types->getIterator() as $type) {
          $unionType = $type->name->value;
          $unionTypes[] = $unionType;
          if (array_key_exists($unionType, $editorBlockTypes)) {
            $editorBlockUnions[$union][$editorBlockTypes[$unionType]] = $unionType;
          }
        }
        if (count($editorBlockUnions[$union]) !== 0 && $unionTypes !== array_values($editorBlockUnions[$union])) {
          throw new LogicException('Block unions have to consist of @editorBlock types only.');
        }
      }
    }

    foreach($editorBlockUnions as $unionType => $typeMap) {
      if (count($typeMap) > 0)  {
        $registry->addTypeResolver($unionType, function ($block) use ($unionType, $typeMap) {
          return $typeMap[$block['blockName']];
        });
      }
    }

  }

  /**
   * Implement field resolvers for this extension.
   */
  protected function addFieldResolvers(ResolverRegistry $registry, ResolverBuilder $builder) {

    $registry->addFieldResolver(
      'Query',
      'drupalFeedInfo',
      $builder->fromValue(array_map(fn (FeedInterface $feed) => $feed->info(), $this->getFeeds()))
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

    foreach($this->getFeeds() as $feed) {

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
    foreach ($this->getResolveDirectives() as $path => $definition) {
      switch ($definition['name']) {

        case 'resolveEntityPath':
          $addResolver($path, $builder->compose(
            $builder->produce('entity_url')->map('entity', $builder->fromParent()),
            $builder->produce('url_path')->map('url', $builder->fromParent()),
            $builder->callback(
              function (string $path) {

                // Gatsby expects raw paths. Not encoded.
                $path = rawurldecode($path);

                // Some paths may ruin Gatsby.
                // See https://github.com/gatsbyjs/gatsby/discussions/36345#discussioncomment-3364844
                $original = $path;
                $bannedCharacters = ['%', '?', '#', '\\'];
                foreach ($bannedCharacters as $character) {
                  if (strpos($path, $character) !== FALSE) {
                    $path = str_replace($character, '', $path);
                    $this->logger->warning("Found entity with '{$character}' character in its path alias. The character will be removed from the Gatsby page path. This can lead to broken links. Please update the entity path alias. Original path alias: '{$original}'.");
                  }
                }
                $dotsOnlyRegex = '/^\.+$/';
                $pathSegments = explode('/', $path);
                $pathSegmentsFiltered = array_filter(
                  $pathSegments,
                  fn (string $segment) => !preg_match($dotsOnlyRegex, $segment)
                );
                if (count($pathSegments) !== count($pathSegmentsFiltered)) {
                  $path = implode('/', $pathSegmentsFiltered);
                  $this->logger->warning("Found entity with dots-only path segment(s) in its path alias. These segments will be removed from the Gatsby page path. This can lead to broken links. Please update the entity path alias. Original path alias: '{$original}'.");
                }

                return $path;
              }
            )
          ));
          break;

        case 'resolveProperty':
          $addResolver($path, $builder->produce('property_path', [
            'path' => $builder->fromValue($definition['arguments']['path']),
            'value' => $builder->fromParent(),
            'type' => $builder->callback(
              fn(EntityInterface $entity) => $entity->getTypedData()->getDataDefinition()->getDataType()
            ),
          ]));
          break;

        case 'resolveEditorBlocks':
          $addResolver($path, $builder->produce('editor_blocks', [
            'path' => $builder->fromValue($definition['arguments']['path']),
            'entity' => $builder->fromParent(),
            'type' => $builder->callback(
              fn(EntityInterface $entity) => $entity->getTypedData()->getDataDefinition()->getDataType()
            ),
            'ignored' => $builder->fromValue($definition['arguments']['ignore'] ?? []),
            'aggregated' => $builder->fromValue($definition['arguments']['aggregate'] ?? ['core/paragraph'])
          ]));
          break;

        case 'resolveEditorBlockAttribute':
          switch ($definition['arguments']['name']) {
            case 'markup':
              $addResolver($path, $builder->produce('editor_block_html')
                ->map('block', $builder->fromParent())
              );
              break;
            case 'media':
              $addResolver($path, $builder->produce('editor_block_media')
                ->map('block', $builder->fromParent())
              );
              break;
            case 'children':
              $addResolver($path, $builder->produce('editor_block_children')
                ->map('block', $builder->fromParent())
              );
              break;
            default:
              $addResolver($path, $builder->produce('editor_block_attribute')
                ->map('block', $builder->fromParent())
                ->map('name', $builder->fromValue($definition['arguments']['name']))
                ->map('plainText', $builder->fromValue($definition['arguments']['plainText'] ?? true))
              );
              break;
          }
          break;

        case 'resolveEntityReference':
          $resolverMultiple = $builder->defaultValue(
            $builder->produce('entity_reference')
              ->map('entity', $builder->fromParent())
              ->map('language', $builder->callback(
                fn(TranslatableInterface $value) => $value->language()->getId()
              ))
              ->map('field', $builder->fromValue($definition['arguments']['field'])),
            $builder->fromValue([])
          );
          if ($definition['arguments']['single']) {
            $addResolver($path, $builder->compose(
              $resolverMultiple,
              $builder->callback(fn(array $values) => reset($values) ?: NULL)
            ));
          }
          else {
            $addResolver($path, $resolverMultiple);
          }
          break;

        case 'resolveEntityReferenceRevisions':
          $resolverMultiple = $builder->defaultValue(
            $builder->produce('entity_reference_revisions')
              ->map('entity', $builder->fromParent())
              ->map('field', $builder->fromValue($definition['arguments']['field'])),
            $builder->fromValue([])
          );
          if ($definition['arguments']['single']) {
            $addResolver($path, $builder->compose(
              $resolverMultiple,
              $builder->callback(fn(array $values) => reset($values) ?: NULL)
            ));
          }
          else {
            $addResolver($path, $resolverMultiple);
          }
          break;

        case 'resolveMenuItems':
          [$type,] = explode('.', $path);
          /** @var MenuFeed $menuFeed */
          $menuFeeds = array_filter($this->getFeeds(), function (FeedInterface $feed) use ($type) {
            return $feed instanceof MenuFeed && $feed->getTypeName() === $type;
          });
          $menuFeed = array_pop($menuFeeds);
          if (!$menuFeed) {
            throw new \Exception('@resolveMenuItems has to be attached to a @menu feed type.');
          }
          $addResolver($path, $builder->compose(
            $builder->tap($builder->produce('language_switch')
              ->map('language', $builder->callback(
                function ($menu) {
                  return $menu->__language ?? \Drupal::service('language_manager')->getCurrentLanguage()->getId();
                }
              ))
            ),
            $builder->produce('menu_links')->map('menu', $builder->fromParent()),
            $builder->produce('gatsby_menu_links')
              ->map('items', $builder->fromParent())
              ->map('max_level', $builder->fromValue($menuFeed->getMaxLevel()))
            ,
          ));
          break;

        case 'resolveMenuItemId':
          $addResolver($path, $builder->callback(
            fn (MenuLinkTreeElement $element) => $element->link->getPluginId()
          ));
          break;

        case 'resolveMenuItemParentId':
          $addResolver($path, $builder->callback(
            fn (MenuLinkTreeElement $element) => $element->link->getParent()
          ));
          break;

        case 'resolveMenuItemLabel':
          $addResolver($path, $builder->compose(
            $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
            $builder->produce('menu_link_label')->map('link', $builder->fromParent()),
          ));
          break;

        case 'resolveMenuItemUrl':
          $addResolver($path, $builder->compose(
            $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
            $builder->produce('menu_link_url')->map('link', $builder->fromParent()),
            $builder->produce('url_path')->map('url', $builder->fromParent()),
          ));
          break;

      }
    }
  }

}
