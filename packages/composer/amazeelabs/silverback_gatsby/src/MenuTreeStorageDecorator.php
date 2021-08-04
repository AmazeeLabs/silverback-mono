<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\Core\Menu\MenuTreeStorageInterface;
use Drupal\silverback_gatsby\Plugin\Gatsby\Feed\MenuFeed;

/**
 * Decorates the menu tree storage and sends updates to Gatsby on modifications.
 */
class MenuTreeStorageDecorator implements MenuTreeStorageInterface {

  /**
   * @var \Drupal\Core\Menu\MenuTreeStorageInterface
   */
  protected MenuTreeStorageInterface $subject;

  /**
   * @var \Drupal\silverback_gatsby\GatsbyUpdateHandler
   */
  protected GatsbyUpdateHandler $updateHandler;

  /**
   * @param \Drupal\Core\Menu\MenuTreeStorageInterface $subject
   *   The decorated menu tree storage service.
   * @param \Drupal\silverback_gatsby\GatsbyUpdateHandler $updateHandler
   *   A Gatsby update handler to send events to.
   */
  public function __construct(
    MenuTreeStorageInterface $subject,
    GatsbyUpdateHandler $updateHandler
  ) {
    $this->subject = $subject;
    $this->updateHandler = $updateHandler;
  }

  /**
   * Send updates after updating a menu item.
   * {@inheritDoc}
   */
  public function save(array $definition) {
    // Emit change events before save to detect if the menu item moved out of
    // a certain level range.
    $this->updateHandler->handle(MenuFeed::class, $definition['id']);
    $this->subject->save($definition);
    // Emit change events after save to update the range it is now in.
    $this->updateHandler->handle(MenuFeed::class, $definition['id']);
  }

  /**
   * Send updates before deleting a menu item.
   * {@inheritDoc}
   */
  public function delete($id) {
    // Delete update handler has to run before the actual delete operation,
    // because afterwards its position in the tree is lost, and it's not possible
    // to determine which layers are affected.
    $this->updateHandler->handle(MenuFeed::class, $id);
    $this->subject->delete($id);
  }

  // ======================================================================
  // Untouched public interface.
  // ======================================================================

  public function maxDepth() {
    return $this->subject->maxDepth();
  }

  public function resetDefinitions() {
    return $this->subject->resetDefinitions();
  }

  public function rebuild(array $definitions) {
    return $this->subject->rebuild($definitions);
  }

  public function load($id) {
    return $this->subject->load($id);
  }

  public function loadMultiple(array $ids) {
    return $this->subject->loadMultiple($ids);
  }

  public function loadByProperties(array $properties) {
    return $this->subject->loadByProperties($properties);
  }

  public function loadByRoute(
    $route_name,
    array $route_parameters = [],
    $menu_name = NULL
  ) {
    return $this->subject->loadByRoute($route_name, $route_parameters, $menu_name);
  }

  public function loadTreeData($menu_name, MenuTreeParameters $parameters) {
    return $this->subject->loadTreeData($menu_name, $parameters);
  }

  public function loadAllChildren($id, $max_relative_depth = NULL) {
    return $this->subject->loadAllChildren($id, $max_relative_depth);
  }

  public function getAllChildIds($id) {
    return $this->subject->getAllChildIds($id);
  }

  public function loadSubtreeData($id, $max_relative_depth = NULL) {
    return $this->subject->loadSubtreeData($id, $max_relative_depth);
  }

  public function getRootPathIds($id) {
    return $this->subject->getRootPathIds($id);
  }

  public function getExpanded($menu_name, array $parents) {
    return $this->subject->getExpanded($menu_name, $parents);
  }

  public function getSubtreeHeight($id) {
    return $this->subject->getSubtreeHeight($id);
  }

  public function menuNameInUse($menu_name) {
    return $this->subject->menuNameInUse($menu_name);
  }

  public function getMenuNames() {
    return $this->subject->getMenuNames();
  }

  public function countMenuLinks($menu_name = NULL) {
    return $this->subject->countMenuLinks($menu_name);
  }

}
