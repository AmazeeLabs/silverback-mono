<?php

namespace Drupal\Tests\silverback_gutenberg\Unit;

use Drupal\silverback_gutenberg\ReferencedContentExtractor;
use Drupal\Tests\UnitTestCase;

class ReferencedContentExtractorTest extends UnitTestCase {

  /**
   * @covers \Drupal\silverback_gutenberg\ReferencedContentExtractor::getTargetEntities
   * @dataProvider targetEntitiesExtractionProvider
   */
  public function testTargetEntitiesExtraction($gutenbergBlocks, $entityTypeAttr, $uuidAttr, $expected) {
    $extractor = new ReferencedContentExtractor();
    $this->assertEquals($expected, $extractor->getTargetEntities($gutenbergBlocks, $entityTypeAttr, $uuidAttr));
  }

  /**
   * Data provider for testTargetEntitiesExtraction().
   *
   * @return array
   */
  public function targetEntitiesExtractionProvider() {
    return [
      // Empty blocks.
      [
        'gutenbergBlocks' => [],
        'entityTypeAttr' => 'entityType',
        'uuidAttr' => 'uuid',
        'expected' => [],
      ],

      // One single root block, with a node reference.
      [
        'gutenbergBlocks' => [
          [
            'attrs' => [
              'entityType' => 'node',
              'uuid' => '111'
            ]
          ]
        ],
        'entityTypeAttr' => 'entityType',
        'uuidAttr' => 'uuid',
        'expected' => [
          'node' => [
            '111' => '111'
          ]
        ],
      ],

      // One single root block, with an array of uuids.
      [
        'gutenbergBlocks' => [
          [
            'attrs' => [
              'entityType' => 'node',
              'uuid' => ['111', '112']
            ]
          ]
        ],
        'entityTypeAttr' => 'entityType',
        'uuidAttr' => 'uuid',
        'expected' => [
          'node' => [
            '111' => '111',
            '112' => '112'
          ]
        ],
      ],

      // More root blocks with references to the same entity type.
      [
        'gutenbergBlocks' => [
          [
            'attrs' => [
              'entityType' => 'node',
              'uuid' => '111'
            ],
          ],
          [
            'attrs' => [
              'entityType' => 'node',
              'uuid' => '112'
            ],
          ]
        ],
        'entityTypeAttr' => 'entityType',
        'uuidAttr' => 'uuid',
        'expected' => [
          'node' => [
            '111' => '111',
            '112' => '112'
          ]
        ],
      ],

      // Multiple root block with inner blocks, referencing one entity type.
      [
        'gutenbergBlocks' => [
          [
            'attrs' => [
              'entityType' => 'node',
              'uuid' => '111'
            ],
            'innerBlocks' => [
              [
                'attrs' => [
                  'entityType' => 'node',
                  'uuid' => '112'
                ],
              ],
              [
                'attrs' => [
                  'entityType' => 'node',
                  'uuid' => '111'
                ],
              ]
            ],
          ],
          [
            'attrs' => [
              'entityType' => 'node',
              'uuid' => '113'
            ],
          ]
        ],
        'entityTypeAttr' => 'entityType',
        'uuidAttr' => 'uuid',
        'expected' => [
          'node' => [
            '111' => '111',
            '112' => '112',
            '113' => '113'
          ]
        ],
      ],

      // Multiple blocks referencing different entity types.
      [
        'gutenbergBlocks' => [
          [
            'attrs' => [
              'entityType' => 'user',
              'uuid' => '111'
            ],
            'innerBlocks' => [
              [
                'attrs' => [
                  'entityType' => 'node',
                  'uuid' => '112'
                ],
              ],
              [
                'attrs' => [
                  'entityType' => 'node',
                  'uuid' => '113'
                ],
              ]
            ],
          ],
        ],
        'entityTypeAttr' => 'entityType',
        'uuidAttr' => 'uuid',
        'expected' => [
          'user' => [
            '111' => '111',
          ],
          'node' => [
            '112' => '112',
            '113' => '113'
          ]
        ],
      ],

      // Multiple blocks, one of them not having the entityType attribute set.
      [
        'gutenbergBlocks' => [
          [
            'attrs' => [
              'uuid' => '111'
            ],
            'innerBlocks' => [
              [
                'attrs' => [
                  'entityType' => 'node',
                  'uuid' => '112'
                ],
              ],
              [
                'attrs' => [
                  'entityType' => 'node',
                  'uuid' => '113'
                ],
              ]
            ],
          ],
        ],
        'entityTypeAttr' => 'entityType',
        'uuidAttr' => 'uuid',
        'expected' => [
          'node' => [
            '111' => '111',
            '112' => '112',
            '113' => '113',
          ]
        ],
      ],

      // Multiple blocks, one of them not having the uuid attribute set.
      [
        'gutenbergBlocks' => [
          [
            'attrs' => [
              'entityType' => 'node',
            ],
            'innerBlocks' => [
              [
                'attrs' => [
                  'entityType' => 'user',
                  'uuid' => '112'
                ],
              ],
              [
                'attrs' => [
                  'entityType' => 'node',
                  'uuid' => '113'
                ],
              ]
            ],
          ],
        ],
        'entityTypeAttr' => 'entityType',
        'uuidAttr' => 'uuid',
        'expected' => [
          'user' => [
            '112' => '112',
          ],
          'node' => [
            '113' => '113',
          ]
        ],
      ],
    ];
  }

}
