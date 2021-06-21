<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Annotation\ContextDefinition;
use Drupal\Core\Menu\InaccessibleMenuLink;
use Drupal\Core\Menu\MenuLinkTreeElement;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\menu_link_content\Plugin\Menu\MenuLinkContent;

/**
 * @DataProducer(
 *   id = "gatsby_menu_links",
 *   name = @Translation("Gatsby menu links"),
 *   description = @Translation("Sparses a menu tree by language and flattens it for Gatsby."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Menu link"),
 *     multiple = TRUE
 *   ),
 *   consumes = {
 *     "items" = @ContextDefinition("any",
 *       label = @Translation("Items"),
 *       multiple = TRUE
 *     ),
 *     "max_level" = @ContextDefinition("integer",
 *       label = @Translation("Maximum depth")
 *     )
 *   }
 * )
 */
class GatsbyMenuLinks extends DataProducerPluginBase {

  /**
   * Filter the menu tree based on the current langauge.
   *
   * @param MenuLinkTreeElement[] $items
   *   A menu tree produced by the "menu_links" plugin.
   * @param int $max_level
   *   The maximum level fetched.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $fieldContext
   *
   * @return MenuLinkTreeElement[]
   *   The flattened menu tree, pruned for the current language. Every item
   *   already matches the `MenuItem` GraphQL type, so we don't need dedicated
   *   resolvers for it.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function resolve(array $items, int $max_level, FieldContext $fieldContext): array {
    $language = $fieldContext->getContextLanguage();
    $items = $this->flatten($items, $max_level - 1);

    $items = array_filter($items, function ($item) use ($language) {
      // Filter out any menu items that are not accessible by the current user.
      if ($item->link instanceof InaccessibleMenuLink) {
        return false;
      }
      // We only care about content links and leave everything else alone.
      if (!($item->link instanceof MenuLinkContent)) {
        return true;
      }
      $entity_id = $item->link->getPluginDefinition()['metadata']['entity_id'];
      /** @var \Drupal\menu_link_content\Entity\MenuLinkContent $menuLink */
      $menuLink = \Drupal::entityTypeManager()
        ->getStorage('menu_link_content')
        ->load($entity_id);
      return !$language || $menuLink->hasTranslation($language) || $menuLink->language()->getId() === $language;
    });

    return $items;
  }

  /**
   * @param MenuLinkTreeElement[] $items
   */
  public static function flatten(array $items, $level = 0) : array {
    $result = array_merge([], $items);
    foreach($items as $item) {
      if ($item->subtree && $level !== 0) {
        $result = array_merge(static::flatten($item->subtree, $level - 1), $result);
      }
    }
    return $result;
  }

}
