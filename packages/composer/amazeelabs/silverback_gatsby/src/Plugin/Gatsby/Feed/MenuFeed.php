<?php

namespace Drupal\silverback_gatsby\Plugin\Gatsby\Feed;

use Drupal\content_translation\ContentTranslationManagerInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Menu\MenuLinkTreeElement;
use Drupal\Core\Menu\MenuLinkTreeInterface;
use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\silverback_gatsby\Annotation\GatsbyFeed;
use Drupal\silverback_gatsby\Plugin\FeedBase;
use Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer\GatsbyMenuLinks;
use Drupal\system\Entity\Menu;
use GraphQL\Language\AST\DocumentNode;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Feed plugin that creates Gatsby feeds based on Drupal menus.
 *
 * @GatsbyFeed(
 *   id = "menu"
 * )
 */
class MenuFeed extends FeedBase implements ContainerFactoryPluginInterface {

  /**
   * The target menu id.
   *
   * @var string
   */
  protected string $menu_id;

  /**
   * The maximum menu level.
   *
   * @var int
   */
  protected int $max_level;

  /**
   * The GraphQL item type used for menu items.
   *
   * @var string
   */
  protected string $item_type;

  /**
   * @var \Drupal\content_translation\ContentTranslationManagerInterface
   */
  protected ContentTranslationManagerInterface $contentTranslationManager;

  /**
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected LanguageManagerInterface $languageManager;

  /**
   * @var \Drupal\Core\Menu\MenuLinkTreeInterface
   */
  protected MenuLinkTreeInterface $menuLinkTree;

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
      $container->get('content_translation.manager'),
      $container->get('menu.link_tree'),
      $container->get('language_manager')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function __construct(
    $config,
    $plugin_id,
    $plugin_definition,
    ContentTranslationManagerInterface $contentTranslationManager,
    MenuLinkTreeInterface $menuLinkTree,
    LanguageManagerInterface $languageManager
  ) {
    $this->menu_id = $config['menu_id'];
    $this->max_level = $config['max_level'] ?? -1;
    $this->item_type = $config['item_type'];
    $this->contentTranslationManager = $contentTranslationManager;
    $this->menuLinkTree = $menuLinkTree;
    $this->languageManager = $languageManager;

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
    return $this->contentTranslationManager->isEnabled('menu_link_content', 'menu_link_content');
  }

  /**
   * {@inheritDoc}
   */
  public function getUpdateIds($context, AccountInterface $account) : array {
    $params = new MenuTreeParameters();
    if ($this->max_level > 0) {
      $params->maxDepth = $this->max_level;
    }
    $tree = $this->menuLinkTree->load($this->menu_id, $params);
    $items = GatsbyMenuLinks::flatten($tree, -1);

    $ids = [$context];
    $match = count(array_filter($items, function (MenuLinkTreeElement $item) use ($ids) {
      return in_array($item->link->getPluginId(), $ids);
    })) > 0;
    return $match ? [$this->menu_id] : [];
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItem(ResolverInterface $id, ?ResolverInterface $langcode = null): ResolverInterface {
    $resolver = $this->builder->produce('entity_load')
      ->map('type', $this->builder->fromValue('menu'))
      ->map('id', $id)
      ->map('access', $this->builder->fromValue(false));
    if ($this->isTranslatable() && $langcode) {
      $resolver->map('language', $langcode);
      $resolver = $this->builder->compose(
        $this->builder->context('current_menu_language', $langcode),
        $resolver,
        $this->builder->callback(function ($value, $args, ResolveContext $context, ResolveInfo $info, FieldContext $fieldContext) {
        $value->__language = $fieldContext->getContextValue('current_menu_language');
        return $value;
      }));
    }
    return $resolver;
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItems(ResolverInterface $limit, ResolverInterface $offset): ResolverInterface {
    return $this->builder->produce('entity_load_multiple')
      ->map('type', $this->builder->fromValue('menu'))
      ->map('ids', $this->builder->fromValue([$this->menu_id]))
      ->map('access', $this->builder->fromValue(false));
  }

  /**
   * {@inheritDoc}
   */
  public function resolveId(): ResolverInterface {
    return $this->builder->produce('entity_id')
      ->map('entity', $this->builder->fromParent());
  }

  /**
   * {@inheritDoc}
   */
  public function resolveLangcode(): ResolverInterface {
    return $this->builder->callback(
      fn(Menu $value, $args, $context, $info, FieldContext $fieldContext) =>
      $value->__language ?? $this->languageManager->getDefaultLanguage()->getId()
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveDefaultTranslation(): ResolverInterface {
    return $this->builder->callback(
      fn(Menu $value) => $value->language()->isDefault()
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveTranslations(): ResolverInterface {
    return $this->builder->compose($this->builder->callback(function (Menu $menu) {
      return array_map(function (LanguageInterface $lang) use ($menu) {
        $clone = clone $menu;
        $clone->__language = $lang->getId();
        return $clone;
      }, $this->languageManager->getLanguages());
    }));
  }

  public function getExtensionDefinition(DocumentNode $parentAst): string {
    $typeName = $this->typeName;
    $itemTypeName = $this->item_type;
    $def = [];
    $def[] = "extend type $typeName {";
    $def[] = "  items: [$itemTypeName!]!";
    $def[] = "}";
    $def[] = "extend type $itemTypeName {";
    $def[] = "  id: String!";
    $def[] = "  parent: String!";
    $def[] = "}";
    return implode("\n", $def);
  }

  public function addExtensionResolvers(
    ResolverRegistryInterface $registry,
    ResolverBuilder $builder
  ): void {
    $registry->addFieldResolver($this->typeName, 'items', $builder->compose(
      $builder->tap($builder->produce('language_switch')
        ->map('language', $builder->callback(
          function ($menu) {
            return $menu->__language ?? $this->languageManager->getDefaultLanguage()->getId();
          }
        ))
      ),
      $builder->produce('menu_links')->map('menu', $builder->fromParent()),
      $builder->produce('gatsby_menu_links')
        ->map('items', $builder->fromParent())
        ->map('max_level', $builder->fromValue($this->max_level))
      ,
    ));
    $registry->addFieldResolver($this->item_type, 'id', $builder->callback(
      fn (MenuLinkTreeElement $element) => $element->link->getPluginId()
    ));
    $registry->addFieldResolver($this->item_type, 'parent', $builder->callback(
      fn (MenuLinkTreeElement $element) => $element->link->getParent()
    ));
  }
}
