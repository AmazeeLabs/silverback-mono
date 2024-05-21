<?php

namespace Drupal\silverback_gatsby\Plugin\Gatsby\Feed;

use Drupal\content_translation\ContentTranslationManagerInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\node\Entity\Node;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\path_alias\Entity\PathAlias;
use Drupal\silverback_gatsby\Plugin\FeedBase;
use Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer\GatsbyBuildId;
use GraphQL\Language\AST\DocumentNode;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Feed plugin that creates Gatsby feeds based on Drupal entities.
 *
 * @GatsbyFeed(
 *   id = "entity"
 * )
 */
class EntityFeed extends FeedBase implements ContainerFactoryPluginInterface {

  /**
   * The target entity type.
   *
   * @var string
   */
  protected string $type;

  /**
   * The target entity bundle.
   *
   * @var string|null
   */
  protected ?string $bundle;

  /**
   * Indicates if Drupal access restrictions should be respected.
   *
   * Defaults to true.
   *
   * @var bool
   */
  protected bool $access;

  /**
   * @var \Drupal\content_translation\ContentTranslationManagerInterface|null
   */
  protected ?ContentTranslationManagerInterface $contentTranslationManager;

  /**
   * The path alias manager.
   *
   * @var \Drupal\path_alias\AliasManagerInterface
   */
  protected $pathAliasManager;

  /**
   * {@inheritDoc}
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
      $container->has('content_translation.manager') ? $container->get('content_translation.manager') : NULL,
      $container->get('path_alias.manager')
    );
  }

  public function __construct(
    $config,
    $plugin_id,
    $plugin_definition,
    ?ContentTranslationManagerInterface $contentTranslationManager,
    AliasManagerInterface $path_alias_manager
  ) {
    $this->type = $config['type'];
    $this->bundle = $config['bundle'] ?? NULL;
    $this->access = $config['access'] ?? TRUE;
    $this->contentTranslationManager = $contentTranslationManager;
    $this->pathAliasManager = $path_alias_manager;

    parent::__construct(
      $config,
      $plugin_id,
      $plugin_definition
    );
  }

  /**
   * {@inheritDoc}
   */
  public function isTranslatable(): bool {
    return $this->contentTranslationManager &&
      $this->contentTranslationManager->isEnabled($this->type, $this->bundle);
  }

  /**
   * {@inheritDoc}
   */
  public function getUpdateIds($context, ?AccountInterface $account) : array {

    // Special case for path alias.
    if ($context instanceof PathAlias) {
      // @todo Add DI
      $path = $this->pathAliasManager->getPathByAlias($context->alias->value);
      if (preg_match('/node\/(\d+)/', $path, $matches)) {
        // @todo Add DI
        $node = isset($matches[1]) ? Node::load($matches[1]) : NULL;
        if ($node) {
          // See SLB-281 for details.
          $context = $node;
        }
      }
    }

    if (
      $context instanceof EntityInterface
      && $context->getEntityTypeId() === $this->type
      && ($this->bundle !== NULL && $context->bundle() === $this->bundle)
      && (!$account || $context->access('view', $account))
    ) {
      if ($this->isTranslatable() && $context instanceof TranslatableInterface) {
        return array_map(function (LanguageInterface $lang) use ($context) {
          $translation = $context->getTranslation($lang->getId());
          return GatsbyBuildId::build($context->uuid(), $translation->language()->getId());
        }, $context->getTranslationLanguages());
      }
      return [$context->uuid()];
    }
    return [];
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItem(ResolverInterface $id, ?ResolverInterface $langcode = NULL): ResolverInterface {
    $resolver = $this->builder->produce('fetch_entity')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundles', $this->builder->fromValue($this->bundle === NULL ? NULL : [$this->bundle]))
      ->map('access', $this->builder->fromValue($this->access))
      ->map('id', $id);
    if ($this->isTranslatable() && $langcode) {
      $resolver->map('language', $langcode);
    }
    return $resolver;
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItems(ResolverInterface $limit, ResolverInterface $offset): ResolverInterface {
    return $this->builder->produce('list_entities')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundle', $this->builder->fromValue($this->bundle))
      ->map('access', $this->builder->fromValue($this->access))
      ->map('offset', $this->builder->defaultValue(
        $this->builder->fromArgument('offset'),
        $this->builder->fromValue(0)
      ))
      ->map('limit', $this->builder->defaultValue(
        $this->builder->fromArgument('limit'),
        $this->builder->fromValue(10),
      ));
  }

  /**
   * {@inheritDoc}
   */
  public function resolveId(): ResolverInterface {
    return $this->builder->produce('entity_uuid')
      ->map('entity', $this->builder->fromParent());
  }

  /**
   * {@inheritDoc}
   */
  public function resolveLangcode(): ResolverInterface {
    return $this->builder->callback(
      fn(TranslatableInterface $value) => $value->language()->getId()
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveDefaultTranslation(): ResolverInterface {
    return $this->builder->callback(
      fn(TranslatableInterface $value) => $value->isDefaultTranslation()
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveTranslations(): ResolverInterface {
    return $this->builder->defaultValue(
      $this->builder->compose(
        $this->builder->produce('entity_translations')->map('entity', $this->builder->fromParent()),
        // entity_translations returns nulls for inaccessible translations. This
        // does not match our schema. Filter nulls out.
        $this->builder->callback(fn ($entities) => $entities ? array_filter($entities) : NULL)
      ),
      $this->builder->callback(fn ($value) => [$value])
    );
  }

  /**
   *
   */
  public function getExtensionDefinition(DocumentNode $parentAst): string {
    $type = $this->typeName;
    return "\nextend type Query { _load{$type}Revision(id: String!, revision: String!) : $type @deprecated }";
  }

  /**
   *
   */
  public function addExtensionResolvers(
    ResolverRegistryInterface $registry,
    ResolverBuilder $builder
  ): void {
    $type = $this->typeName;
    $idResolver = $this->isTranslatable()
      ? $builder->produce('gatsby_extract_id')->map('id', $builder->fromArgument('id'))
      : $builder->fromArgument('id');
    $langResolver = $this->isTranslatable()
      ? $builder->produce('gatsby_extract_langcode')->map('id', $builder->fromArgument('id'))
      : $builder->fromValue(NULL);
    $resolver = $this->builder->produce('fetch_entity')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundles', $this->builder->fromValue($this->bundle === NULL ? NULL : [$this->bundle]))
      ->map('access', $this->builder->fromValue($this->access))
      ->map('id', $idResolver)
      ->map('language', $langResolver)
      ->map('revision_id', $builder->fromArgument('revision'));
    $registry->addFieldResolver("Query", "_load{$type}Revision", $resolver);
  }

}
