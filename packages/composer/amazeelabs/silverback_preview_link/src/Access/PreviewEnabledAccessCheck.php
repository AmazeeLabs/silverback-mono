<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Access\AccessResultInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Symfony\Component\Routing\Route;

/**
 * Generate preview link access check.
 */
class PreviewEnabledAccessCheck implements AccessInterface {

  protected ImmutableConfig $config;

  /**
   * PreviewEnabledAccessCheck constructor.
   */
  public function __construct(ConfigFactoryInterface $configFactory) {
    $this->config = $configFactory->get('silverback_preview_link.settings');
  }

  /**
   * Checks access to both the generate route and the preview route.
   */
  public function access(Route $route, RouteMatchInterface $route_match): AccessResultInterface {
    // Get the entity for both the preview route and the generate preview link
    // route.
    $entity = match($route->getOption('silverback_preview_link.entity_type_id')) {
      NULL => $route_match->getParameter('entity'),
      default => $route_match->getParameter($route->getOption('silverback_preview_link.entity_type_id')),
    };

    return AccessResult::allowedIf($this->entityTypeAndBundleEnabled($entity))
      ->addCacheableDependency($entity)
      ->addCacheContexts(['route'])
      ->addCacheableDependency($this->config);
  }

  /**
   * Check if the entity type and bundle are enabled.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity.
   *
   * @return bool
   *   TRUE if enabled, FALSE otherwise.
   */
  protected function entityTypeAndBundleEnabled(EntityInterface $entity): bool {
    $enabled_entity_types = $this->config->get('enabled_entity_types');

    // If no entity types are specified, fallback to allowing all.
    if (count($enabled_entity_types) === 0) {
      return TRUE;
    }

    // If the entity type exists in the configuration object.
    if (isset($enabled_entity_types[$entity->getEntityTypeId()])) {
      $enabled_bundles = $enabled_entity_types[$entity->getEntityTypeId()];
      // If no bundles were specified, assume all bundles are enabled.
      if (count($enabled_bundles) === 0) {
        return TRUE;
      }
      // Otherwise fallback to requiring the specific bundle.
      if (in_array($entity->bundle(), $enabled_bundles, TRUE)) {
        return TRUE;
      }
    }

    return FALSE;
  }

}
