<?php

namespace Drupal\silverback_external_preview\Field;

use Drupal\Core\Field\FieldItemList;
use Drupal\Core\TypedData\ComputedItemListTrait;

class ComputedExternalPreviewLinkItemList extends FieldItemList {

  use ComputedItemListTrait;

  /**
   * @inheritDoc
   */
  protected function computeValue() {
    $entity = $this->getEntity();
    if ($entity->isNew()) {
      return;
    }
    /** @var \Drupal\silverback_external_preview\ExternalPreviewLink $externalPreviewLink */
    $externalPreviewLink = \Drupal::service('silverback_external_preview.external_preview_link');
    $uri = $externalPreviewLink->createPreviewUrlFromEntity($entity)->toUriString();
    $items = [];
    $items[] = [
      'uri' => $uri,
      'title' => $this->t('Preview @label', [
        '@label' => $entity->label(),
      ]),
    ];
    foreach ($items as $delta => $item) {
      $this->list[] = $this->createItem($delta, $item);
    }
  }

}
