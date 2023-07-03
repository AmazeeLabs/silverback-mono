<?php

namespace Drupal\silverback_gutenberg;

use Drupal\Component\Utility\Html;
use Drupal\Core\Entity\EntityRepositoryInterface;

class LinkedContentExtractor {

  public function getTargetEntities($sourceText) {
    $document = Html::load($sourceText);
    $references = [];
    foreach ($document->getElementsByTagName('a') as $link) {
      if ($link->hasAttribute('data-id')) {
        $uuid = $link->getAttribute('data-id');
        // The default entity type should be, for convenience, node.
        $entityType = $link->hasAttribute('data-entity-type') ? $link->getAttribute('data-entity-type') : 'node';
        $references[$entityType][$uuid] = $uuid;
      }
    }
    return $references;
  }
}
