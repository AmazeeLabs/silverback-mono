<?php
 namespace Drupal\silverback_gutenberg;

class EditorBlocksProcessor {

  static function aggregateParagraphs(array $blocks, ?array $types = ['core/paragraph']) {
    $processed = [];
    $content = [];
    foreach ($blocks as $block) {
      if (in_array($block['blockName'], $types)) {
        $content[] = $block['innerHTML'];
      }
      else {
        if (count($content)) {
          $processed[] = [
            'blockName' => 'core/paragraph',
            'innerHTML' => implode('', $content),
          ];
          $content = [];
        }
        if ($block['innerBlocks']) {
          $block['innerBlocks'] = static::aggregateParagraphs($block['innerBlocks'], $types);
        }
        $processed[] = $block;
      }
    }
    if (count($content)) {
      $processed[] = [
        'blockName' => 'core/paragraph',
        'innerHTML' => implode('', $content),
      ];
    }
    return $processed;
  }

  static function processsIgnoredBlocks(array $blocks, ?array $ignored) {
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
