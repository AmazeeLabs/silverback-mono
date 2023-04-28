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
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock4 = [
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
        'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed.',
      ]
    );

    $this->assertEquals(
      $this->validateCardinality($invalidBlock4, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'Required blocks are missing. <em class="placeholder">Paragraph</em>: there should be between 1 and 2 blocks.',
      ]
    );
  }

  public function testSpecificBlockTypeMultipleMinimumAndMaximum() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 1,
        'max' => 2,
      ],
      [
        'blockName' => 'core/list',
        'blockLabel' => t('List'),
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
        [
          'blockName' => 'core/list',
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
          'blockName' => 'core/list',
        ],
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
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock3 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/image',
        ],
      ],
    ];
    $invalidBlock4 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
        [
          'blockName' => 'core/list',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $invalidBlock5 = [
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
    $messageParams = [
      '%label' => $expectedChildren[1]['blockLabel'],
      '@min' => $expectedChildren[1]['min'],
      '@max' => $expectedChildren[1]['max'],
    ];
    $result = t('%label: there should be between @min and @max blocks.', $messageParams);
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
        'message' => $result,
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock4, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed.',
        // @todo improve: error message could mention both block types on the same validation.
        //'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed. <em class="placeholder">List</em>: at most 2 blocks are allowed.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock5, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'Required blocks are missing. <em class="placeholder">Paragraph</em>: there should be between 1 and 2 blocks. <em class="placeholder">List</em>: there should be between 1 and 2 blocks.',
      ]
    );
  }

  public function testAnyBlockTypeMinimumAndMaximum() {
    $expectedChildren = [
      'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
      'min' => 1,
      'max' => 2,
    ];

    $validBlock1 = [
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
    $validBlock2 = [
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
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
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
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'At most 2 blocks are allowed.',
      ]
    );
  }

  public function testSpecificBlockTypeSingleExactMatch() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 2,
        'max' => 2,
      ],
    ];

    $validBlock = [
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
    $invalidBlock1 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
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
    $invalidBlock3 = [
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
    $invalidBlock4 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];

    $this->assertEquals(
      $this->validateCardinality($validBlock, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );

    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock3, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: there should be exactly 2 blocks.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock4, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed.',
      ]
    );
  }

  public function testSpecificBlockTypeMultipleExactMatch() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 2,
        'max' => 2,
      ],
      [
        'blockName' => 'core/list',
        'blockLabel' => t('List'),
        'min' => 1,
        'max' => 1,
      ],
    ];

    $validBlock = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
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
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
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
    $invalidBlock3 = [
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
    $invalidBlock4 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $invalidBlock5 = [
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

    $this->assertEquals(
      $this->validateCardinality($validBlock, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );

    // @todo improve: error message could mention both block types on the same validation.
    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock3, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: there should be exactly 2 blocks.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock4, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock5, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">List</em>: there should be exactly 1 block.',
      ]
    );
  }

  public function testAnyBlockTypeExactMatch() {
    $expectedChildren = [
      'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
      'min' => 2,
      'max' => 2,
    ];

    $validBlock1 = [
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
    $invalidBlock1 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
        [
          'blockName' => 'core/paragraph',
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
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'At least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'At most 2 blocks are allowed.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock3, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'At least 2 blocks are required.',
      ]
    );
  }

  public function testSpecificBlockTypeSingleNoMinimumWithMaximum() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 0,
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
      'innerBlocks' => [],
    ];
    $validBlock4 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
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
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
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
    $this->assertEquals(
      $this->validateCardinality($validBlock4, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );

    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed.',
      ]
    );
  }

  public function testSpecificBlockTypeMultipleNoMinimumWithMaximum() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 0,
        'max' => 2,
      ],
      [
        'blockName' => 'core/list',
        'blockLabel' => t('List'),
        'min' => 0,
        'max' => 1,
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
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $validBlock3 = [
      'blockName' => 'core/column',
      'innerBlocks' => [],
    ];
    $validBlock4 = [
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
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
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
    $this->assertEquals(
      $this->validateCardinality($validBlock4, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );

    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at most 2 blocks are allowed.',
      ]
    );
  }

  public function testAnyBlockTypeNoMinimumWithMaximum() {
    $expectedChildren = [
      'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
      'min' => 0,
      'max' => 2,
    ];

    $validBlock1 = [
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
      ],
    ];
    $validBlock4 = [
      'blockName' => 'core/column',
      'innerBlocks' => [],
    ];
    $invalidBlock1 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
      ],
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
    $this->assertEquals(
      $this->validateCardinality($validBlock4, $expectedChildren),
      [
        'is_valid' => TRUE,
        'message' => '',
      ]
    );

    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'At most 2 blocks are allowed.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'At most 2 blocks are allowed.',
      ]
    );
  }

  public function testSpecificBlockTypeSingleMinimumWithNoMaximum() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 2,
        'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
      ],
    ];

    $validBlock1 = [
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
    $validBlock2 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
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
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
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
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
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

    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'Required blocks are missing. <em class="placeholder">Paragraph</em>: there should be between 2 and unlimited blocks.',
      ]
    );
  }

  public function testSpecificBlockTypeMultipleMinimumWithNoMaximum() {
    $expectedChildren = [
      [
        'blockName' => 'core/paragraph',
        'blockLabel' => t('Paragraph'),
        'min' => 2,
        'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
      ],
      [
        'blockName' => 'core/list',
        'blockLabel' => t('List'),
        'min' => 1,
        'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
      ],
    ];

    $validBlock1 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
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
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
        [
          'blockName' => 'core/list',
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
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
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
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
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
    $invalidBlock3 = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $invalidBlock4 = [
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
    $invalidBlock5 = [
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

    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock3, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">Paragraph</em>: at least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock4, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => '<em class="placeholder">List</em>: there should be between 1 and unlimited blocks.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock5, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'Required blocks are missing. <em class="placeholder">Paragraph</em>: there should be between 2 and unlimited blocks. <em class="placeholder">List</em>: there should be between 1 and unlimited blocks.',
      ]
    );
  }

  public function testAnyBlockTypeMinimumWithNoMaximum() {
    $expectedChildren = [
      'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
      'min' => 2,
      'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
    ];

    $validBlock1 = [
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
          'blockName' => 'core/paragraph',
        ],
      ],
    ];
    $invalidBlock2 = [
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

    $this->assertEquals(
      $this->validateCardinality($invalidBlock1, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'At least 2 blocks are required.',
      ]
    );
    $this->assertEquals(
      $this->validateCardinality($invalidBlock2, $expectedChildren),
      [
        'is_valid' => FALSE,
        'message' => 'At least 2 blocks are required.',
      ]
    );
  }

}
