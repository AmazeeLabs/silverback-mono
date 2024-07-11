<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link\Routing;

use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\Routing\EntityRouteProviderInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;

/**
 * Preview Link route provider.
 */
class PreviewLinkRouteProvider implements EntityRouteProviderInterface {

  /**
   * {@inheritdoc}
   */
  public function getRoutes(EntityTypeInterface $entity_type) {
    $collection = new RouteCollection();

    $generateRoute = $this->getGeneratePreviewLinkRoute($entity_type);
    if ($generateRoute !== NULL) {
      $entity_type_id = $entity_type->id();
      $collection->add("entity.{$entity_type_id}.silverback_preview_link_generate", $generateRoute);
    }

    return $collection;
  }

  /**
   * Gets the route for generating and viewing preview links for this entity.
   *
   * @param \Drupal\Core\Entity\EntityTypeInterface $entity_type
   *   The entity type.
   *
   * @return \Symfony\Component\Routing\Route|null
   *   The generated route, if available.
   */
  protected function getGeneratePreviewLinkRoute(EntityTypeInterface $entity_type): ?Route {
    $entity_type_id = $entity_type->id();
    $route = new Route($entity_type->getLinkTemplate('preview-link-generate'));

    $route
      ->setDefaults([
        '_entity_form' => "silverback_preview_link.silverback_preview_link",
        '_title' => 'Share preview',
      ])
      ->setRequirement('_permission', 'generate silverback preview links')
      ->setRequirement('_access_preview_enabled', 'TRUE')
      ->setOption('silverback_preview_link.entity_type_id', $entity_type_id)
      ->setOption('_admin_route', TRUE)
      ->setOption('parameters', [
        $entity_type_id => ['type' => 'entity:' . $entity_type_id],
      ]);

    return $route;
  }

}
