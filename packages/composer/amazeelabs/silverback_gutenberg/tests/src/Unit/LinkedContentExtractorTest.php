<?php

namespace Drupal\Tests\silverback_gutenberg\Unit;

use Drupal\silverback_gutenberg\LinkedContentExtractor;
use Drupal\Tests\UnitTestCase;

class LinkedContentExtractorTest extends UnitTestCase {

  /**
   * @covers \Drupal\silverback_gutenberg\LinkedContentExtractor::getTargetEntities
   * @dataProvider targetEntitiesExtractionProvider
   */
  public function testTargetEntitiesExtraction($sourceText, $expected) {
    $extractor = new LinkedContentExtractor();
    $this->assertEquals($expected, $extractor->getTargetEntities($sourceText));
  }

  /**
   * Data provider for testTargetEntitiesExtraction().
   *
   * @return array
   */
  public function targetEntitiesExtractionProvider() {
    return [
      [
        'sourceText' => '<div>This is a text with <span>no internally referenced</span> <a href="https://www.example.com">content</a>.</div>',
        'expected' => [],
      ],
      [
        'sourceText' => '<div>This is a simple <a href="/" data-id="111" data-entity-type="node">link</a></div>',
        'expected' => [
          'node' => [
            '111' => '111'
          ]
        ]
      ],
      [
        'sourceText' => '<div>This is a <p>node <a href="/" data-id="111" data-entity-type="node">reference</a>, another node <a href="/" data-id="112" data-entity-type="node">reference</a></p>,<p>then another duplicated node <a href="/" data-id="111" data-entity-type="node">reference</a></p> and one custom entity <a href="/" data-id="222" data-entity-type="custom_entity">reference</a></div>',
        'expected' => [
          'node' => [
            '111' => '111',
            '112' => '112',
          ],
          'custom_entity' => [
            '222' => '222'
          ]
        ]
      ],
      [
        'sourceText' => '<div>This is a node <a href="/" data-id="111">reference</a> without the data-entity-type attribute</div>',
        'expected' => [
          'node' => [
            '111' => '111'
          ]
        ]
      ],
      [
        'sourceText' => '<div>This is a node <a href="/" data-entity-type="node">reference</a> without the data-id attribute</div>',
        'expected' => []
      ],
    ];
  }

}
