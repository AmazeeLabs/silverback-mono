<?php

namespace Drupal\silverback_gutenberg\Tests\Unit;

use Drupal\silverback_gutenberg\EditorBlocksProcessor;
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

  public function testTextAggregation() {
    $input = [
      [
        'blockName' => 'core/paragraph',
        'innerHTML' => '<p>A</p>',
      ],
      [
        'blockName' => 'core/paragraph',
        'innerHTML' => '<p>B</p>',
      ],
      [
        'blockName' => 'custom/a',
        'innerBlocks' => [

          [
            'blockName' => 'core/paragraph',
            'innerHTML' => '<p>C</p>',
          ],
          [
            'blockName' => 'core/list',
            'innerHTML' => '<p>D</p>',
          ],
        ]
      ],
      [
        'blockName' => 'core/paragraph',
        'innerHTML' => '<p>E</p>',
      ],
    ];

    $expected = [
      [
        'blockName' => 'core/paragraph',
        'innerHTML' => '<p>A</p><p>B</p>',
      ],
      [
        'blockName' => 'custom/a',
        'innerBlocks' => [
          [
            'blockName' => 'core/paragraph',
            'innerHTML' => '<p>C</p><p>D</p>',
          ],
        ]
      ],
      [
        'blockName' => 'core/paragraph',
        'innerHTML' => '<p>E</p>',
      ],
    ];
    $this->assertEquals(
      $expected,
      EditorBlocksProcessor::aggregateParagraphs($input, ['core/paragraph', 'core/list']),
    );
  }

}
