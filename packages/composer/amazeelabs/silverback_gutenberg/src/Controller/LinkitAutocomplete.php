<?php

namespace Drupal\silverback_gutenberg\Controller;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Entity\EntityInterface;
use Drupal\gutenberg\Controller\SearchController;
use Drupal\linkit\Controller\AutocompleteController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class LinkitAutocomplete extends SearchController {

  public function search(Request $request): JsonResponse {
    // As we're limited on changes we can make to the Gutenberg plugin, we're
    // using the subtype to identify the linkit profile to use. With it defaulting
    // to a linkit profile with id gutenberg. By default, it's set to the string "undefined", so we
    // need to check for that as well.
    $linkitProfileIdParam = $request->query->get('subtype');
    $linkitProfileId = $linkitProfileIdParam !== "undefined" && $linkitProfileIdParam ? $linkitProfileIdParam : 'gutenberg';

    if (
      !\Drupal::moduleHandler()->moduleExists('linkit') ||
      !($linkitProfile = \Drupal::entityTypeManager()->getStorage('linkit_profile')->load($linkitProfileId))
    ) {
      return parent::search($request);
    }

    $type = (string) $request->query->get('type');
    if ($type !== 'post') {
      return new JsonResponse([]);
    }

    $result = [];
    $search = (string) $request->query->get('search');
    $request->query->set('q', $search);
    $linkitController = AutocompleteController::create(\Drupal::getContainer());
    $response = $linkitController->autocomplete($request, $linkitProfile);
    $rows = Json::decode($response->getContent())['suggestions'] ?? [];
    /** @var \Drupal\linkit\SubstitutionManagerInterface $substitutionManager */
    $substitutionManager = \Drupal::service('plugin.manager.linkit.substitution');
    /** @var \Drupal\Core\Entity\EntityRepositoryInterface $entityRepository */
    $entityRepository = \Drupal::service('entity.repository');
    $langcode = \Drupal::languageManager()->getCurrentLanguage()->getId();
    foreach ($rows as $row) {
      $url = NULL;
      $entity = NULL;
      if (isset($row['entity_type_id'], $row['entity_uuid'])) {
        if ($entity = $entityRepository->loadEntityByUuid($row['entity_type_id'], $row['entity_uuid'])) {
          $entity = $entityRepository->getTranslationFromContext($entity, $langcode);
          if (isset($row['substitution_id'])) {
            $url = $substitutionManager
              ->createInstance($row['substitution_id'])
              ->getUrl($entity)
              ->toString();
          }
        }
      }
      $result[] = [
        'id' => $row['entity_uuid'],
        'title' => $row['label'],
        'type' => $entity
          ? $this->getBundle($entity)
          : ($row['entity_type_id'] ?? $row['description'] ?? NULL),
        'url' => $url ?? $row['path'],
      ];
    }

    return new JsonResponse($result);
  }

  protected function getBundle(EntityInterface $entity): string {
    $entityType = $entity->getEntityType();
    $bundle = NULL;
    if ($entityType->hasKey('bundle')) {
      $bundleKey = $entityType->getKey('bundle');
      $bundle = $entity->get($bundleKey)->entity;
    }
    return $bundle
      ? "{$entityType->getLabel()}: {$bundle->label()}"
      : "{$entityType->getLabel()}";
  }

}
