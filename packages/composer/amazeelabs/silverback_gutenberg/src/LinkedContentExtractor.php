<?php

namespace Drupal\silverback_gutenberg;

use Drupal\Component\Utility\Html;

class LinkedContentExtractor {

  /**
   * Give a source (html) text, it returns all the references to content coming
   * from html link tags. The link tags have to have the data-id attribute,
   * identifying the uuid of the entity, and optionally the data-entity-type
   * attribute, identifying the entity type. If not present, the
   * data-entity-type value defaults to 'node'
   *
   * The above attributes (data-id and data-entity-type) should be set by the
   * LinkProcessor class when the gutenberg blocks are saved into the database.
   *
   * @param string $sourceText
   * @return array
   */
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
