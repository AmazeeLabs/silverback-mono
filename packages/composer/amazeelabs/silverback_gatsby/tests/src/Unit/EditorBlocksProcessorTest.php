<?php

namespace Drupal\silverback_gatsby\Tests\Unit;

use Drupal\silverback_gatsby\EditorBlocksProcessor;
use Drupal\Tests\UnitTestCase;

class EditorBlocksProcessorTest extends UnitTestCase {

  public function testNoBlocks() {
    $this->assertEquals(
      EditorBlocksProcessor::processsIgnoredBlocks([], []),
      []
    );
  }

  public function testNoTransientBlocks() {
    $input = [
      [
        'blockName' => 'custom/a',
      ],
      [
        'blockName' => 'custom/b',
      ],
    ];
    $expected = [
      [
        'blockName' => 'custom/a',
      ],
      [
        'blockName' => 'custom/b',
      ],
    ];
    $this->assertEquals(
      $expected,
      EditorBlocksProcessor::processsIgnoredBlocks($input, ['custom/c']),
    );
  }

  public function testTransientBlocks() {
    $input = [
      [
        'blockName' => 'custom/a',
      ],
      [
        'blockName' => 'custom/c',
        'innerBlocks' => [
          [
            'blockName' => 'custom/d',
          ],
          [
            'blockName' => 'custom/e',
          ],
        ],
      ],
      [
        'blockName' => 'custom/b',
      ],
    ];

    $expected = [
      [
        'blockName' => 'custom/a',
      ],
      [
        'blockName' => 'custom/d',
      ],
      [
        'blockName' => 'custom/e',
      ],
      [
        'blockName' => 'custom/b',
      ],
    ];
    $this->assertEquals(
      $expected,
      EditorBlocksProcessor::processsIgnoredBlocks($input, ['custom/c']),
    );
  }

}
