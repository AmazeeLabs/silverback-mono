<?php

namespace Drupal\silverback_gutenberg;

class ReferencedContentExtractor {

  /**
   * Given an array of Gutenberg blocks, it returns all the referenced content
   * based on specific entity type and uuid attributes.
   *
   * @param array $gutenbergBlocks
   *  An array of parsed gutenberg blocks.
   * @param string $entityTypeAttribute
   *  The attribute name which identifies the entity type.
   * @param string $uuidAttribute
   *  The attribute name which identifies the uuid.
   * @return array
   */
  public function getTargetEntities(
    array $gutenbergBlocks,
    string $entityTypeAttribute = 'entityType',
    string $uuidAttribute = 'uuid'
  ) {
    $targetEntities = [];
    $this->extractReferencesFromGutenbergBlocks($gutenbergBlocks, $entityTypeAttribute, $uuidAttribute, $targetEntities);
    return $targetEntities;
  }

  /**
   * Recursively extracts the content that is referenced inside an array of
   * Gutenberg blocks. This is basically a helper for the public
   * getTargetEntities() method.
   *
   * @param array $blocks
   *  An array of parsed gutenberg blocks.
   * @param string $entityTypeAttribute
   *  The attribute name which identifies the entity type.
   * @param string $uuidAttribute
   *  The attribute name which identifies the uuid.
   * @param array $references
   *  An array with all the extracted references until the current call.
   * @return void
   */
  protected function extractReferencesFromGutenbergBlocks(
    array $blocks,
    string $entityTypeAttribute,
    string $uuidAttribute,
    array &$references
  ) {
    foreach ($blocks as $block) {
      if (!empty($block['attrs'][$uuidAttribute])) {
        $uuid = $block['attrs'][$uuidAttribute];
        // The default entity type should be, for convenience, node.
        $entityType = $block['attrs'][$entityTypeAttribute] ?? 'node';
        // Usually, the uuid would be one single value, but we also support an
        // array of values.
        $uuidList = is_array($uuid) ? $uuid : [$uuid];
        foreach ($uuidList as $uuidItem) {
          $references[$entityType][$uuidItem] = $uuidItem;
        }
      }
      if (!empty($block['innerBlocks'])) {
        $this->extractReferencesFromGutenbergBlocks($block['innerBlocks'], $entityTypeAttribute, $uuidAttribute, $references);
      }
    }
  }
}
