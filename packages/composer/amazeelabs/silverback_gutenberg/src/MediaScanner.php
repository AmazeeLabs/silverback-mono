<?php

namespace Drupal\silverback_gutenberg;

use Drupal\gutenberg\Parser\BlockParser;

class MediaScanner {

  public function extract(string $content) {
    $parser = new BlockParser();
    $blocks = $parser->parse($content);
    return $this->extractFromBlocks($blocks);
  }

  protected function extractFromBlocks(array $blocks) {
    $blockIds = array_map(function (array $block) {
      $ids = isset($block['attrs']['mediaEntityIds']) ? [$block['attrs']['mediaEntityIds']] : [];
      $childrenIds = (isset($block['innerBlocks']) ? [$this->extractFromBlocks($block['innerBlocks'])] : []);
      return $ids + $childrenIds;
    }, $blocks);
    return array_reduce(array_reduce($blockIds, 'array_merge', []), 'array_merge', []) ?? [];
  }

}
