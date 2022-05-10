<?php
 namespace Drupal\silverback_gatsby;

class EditorBlocksProcessor {
  static function processsIgnoredBlocks(array $blocks, array $ignored) {
    $processed = [];
    foreach (array_filter($blocks, fn ($block) => !!$block['blockName']) as $block) {
      if (in_array($block['blockName'], $ignored)) {
        foreach ((static::processsIgnoredBlocks($block['innerBlocks'] ?? [], $ignored)) as $child) {
          $processed[] = $child;
        }
      }
      else {
        $processed[] = $block;
      }
    }
    return $processed;
  }
}
