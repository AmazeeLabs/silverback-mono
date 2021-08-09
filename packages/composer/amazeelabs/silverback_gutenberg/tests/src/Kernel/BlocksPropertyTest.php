<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\node\Entity\Node;

class BlocksPropertyTest extends GutenbergTestBase {

  function testEmptyBlocks() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'body' => '<!-- wp:paragraph --><p>Test</p><!-- /wp:paragraph -->',
    ]);
    $this->assertEquals([], $node->body->gutenberg_blocks->getValue('__children')->getValue('__children'));
  }
}
