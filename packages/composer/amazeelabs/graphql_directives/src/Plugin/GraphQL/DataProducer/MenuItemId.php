<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\DataProducer;

use Drupal\Core\Menu\MenuLinkTreeElement;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * @DataProducer(
 *   id = "menu_item_id",
 *   name = @Translation("Menu item identifier"),
 *   description = @Translation("Returns the menu item identifier."),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("Identifier")
 *   ),
 *   consumes = {
 *     "item" = @ContextDefinition("any",
 *       label = @Translation("Menu tree element")
 *     )
 *   }
 * )
 */
class MenuItemId extends DataProducerPluginBase {

  public function resolve(MenuLinkTreeElement $item) {
    return $item->link->getPluginId();
  }

}