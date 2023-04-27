<?php

namespace Drupal\Tests\silverback_gutenberg\Unit;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorInterface;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorTrait;
use Drupal\Tests\UnitTestCase;

/**
 * Block cardinality validator test.
 *
 * Edge cases
 * - Empty validation
 * - No validation: 0 as minimum, but maximum as unlimited
 *
 * Limit by
 * - minimum and maximum
 * - minimum = maximum (exact match)
 * - 0 as minimum, but maximum is set
 * - has minimum, but no maximum is unlimited
 *
 * Variations
 * - with specific / any block type
 * - with single and multiple children
 */
class BlockValidatorCardinalityTest extends UnitTestCase {

  use GutenbergCardinalityValidatorTrait;

  public function setUp(): void {
    parent::setUp();
    $container = new ContainerBuilder();
    \Drupal::setContainer($container);
    $container->set('string_translation', self::getStringTranslationStub());
  }

  public function testEmptyCardinality() {
    $expectedChildren = [];
    $block = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $this->assertEquals(
      $this->validateCardinality($block, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );
  }

  public function testNoLimitation() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 0,
        'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
      ],
    ];
    $block = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $this->assertEquals(
      $this->validateCardinality($block, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );
  }

  public function testSpecificBlockTypeSingleMinimumAndMaximum() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 1,
        'max' => 2,
      ],
    ];

    $validBlock1 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $validBlock2 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $validBlock3 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $invalidBlock1 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/gallery',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $invalidBlock2 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $invalidBlock3 = [
      'blockName' => 'core/column',
      'innerBlocks' => [],
    ];

    $this->assertEquals(
      $this->validateCardinality($validBlock1, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($validBlock2, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($validBlock3, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );

    $messageParams = [
      '%label' => $expectedChildren[0]['blockLabel'],
      '@min' => $expectedChildren[0]['min'],
      '@max' => $expectedChildren[0]['max'],
    ];
    $result = t('%label: there should be between @min and @max blocks.', $messageParams);
    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => $result,
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => $result,
      ]
    );

    $this->assertEquals(
      $this->validateCardinality($invalidBlock3, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'Required blocks are missing. <em class="placeholder">Paragraph</em>: there should be between 1 and 2 blocks.',
      ]
    );
  }

  public function testSpecificBlockTypeMultipleMinimumAndMaximum() {
    // @todo implement
  }

  public function testAnyBlockTypeMinimumAndMaximum() {
    // @todo implement
  }

  public function testSpecificBlockTypeSingleExactMatch() {
    // @todo implement
  }

  public function testSpecificBlockTypeMultipleExactMatch() {
    // @todo implement
  }

  public function testAnyBlockTypeExactMatch() {
    // @todo implement
  }

  public function testSpecificBlockTypeSingleNoMinimumWithMaximum() {
    // @todo implement
  }

  public function testSpecificBlockTypeMultipleNoMinimumWithMaximum() {
    // @todo implement
  }

  public function testAnyBlockTypeNoMinimumWithMaximum() {
    // @todo implement
  }

  public function testAnyBlockTypeSingleMinimumWithNoMaximum() {
    // @todo implement
  }

  public function testAnyBlockTypeMultipleMinimumWithNoMaximum() {
    // @todo implement
  }

  public function testAnyBlockTypeMinimumWithNoMaximum() {
    // @todo implement
  }

}
