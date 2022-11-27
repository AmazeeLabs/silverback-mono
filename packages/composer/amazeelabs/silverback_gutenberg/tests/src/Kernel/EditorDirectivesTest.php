<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\silverback_gutenberg\BlockSerializer;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use Drupal\Tests\media\Traits\MediaTypeCreationTrait;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\TestFileCreationTrait;

class EditorDirectivesTest extends GraphQLTestBase {
  public static $modules = [
    'graphql_directives',
    'text',
    'file',
    'media',
    'image',
    'path_alias',
    'silverback_gutenberg'
  ];

  use ContentTypeCreationTrait;
  use NodeCreationTrait;
  use MediaTypeCreationTrait;
  use TestFileCreationTrait;

  public function getQueryFromFile($queryFile) {
    return file_get_contents(__DIR__ . '/../../graphql/queries/' . $queryFile);
  }

  protected function setUp(): void {
    parent::setUp();
    $this->installEntitySchema('media');
    $this->installEntitySchema('file');
    $this->installSchema('file', ['file_usage']);
    $this->installConfig('media');

    $this->createMediaType('image', ['id' => 'image']);
    $this->container->get('content_translation.manager')->setEnabled(
      'media',
      'image',
      TRUE
    );

    $pageType = NodeType::create(
      [
        'type' => 'page',
        'name' => 'Page',
        'translatable' => TRUE,
      ]
    );
    $pageType->save();

    $this->container->get('content_translation.manager')->setEnabled(
      'node',
      'page',
      TRUE
    );

    FieldStorageConfig::create([
      'field_name' => 'body',
      'entity_type' => 'node',
      'type' => 'text_long',
      'cardinality' => 1,
    ])->save();

    FieldConfig::create([
      'field_name' => 'body',
      'entity_type' => 'node',
      'bundle' => 'page',
      'label' => 'Body',
    ])->save();

    $this->createTestServer('directable', '/editor-test', [
      'schema_configuration' => [
        'directable' => [
          'schema_definition' => __DIR__ . '/../../graphql/editor.graphqls',
        ]
      ]
    ]);

    $directives = $this->container->get('graphql_directives.printer')
      ->printDirectives();

    file_put_contents(
      __DIR__ . '/../../graphql/directives.graphqls',
      $directives
    );
  }

  function testEditorBlockResolution() {

    File::create([
      'uri' => $this->getTestFiles('image')[0]->uri,
    ])->save();
    $media = Media::create([
      'bundle' => 'image',
      'name' => 'Screaming hairy armadillo',
      'field_media_image' => [
        [
          'target_id' => 1,
          'alt' => 'Screaming hairy armadillo',
          'title' => 'Screaming hairy armadillo',
        ],
      ],
    ]);
    $media->addTranslation('de', [
      'bundle' => 'image',
      'name' => 'Screaming hairy armadillo',
      'field_media_image' => [
        [
          'target_id' => 1,
          'alt' => 'Screaming hairy armadillo DE',
          'title' => 'Screaming hairy armadillo DE',
        ],
      ],
    ])->save();
    $media->save();

    $serializer = new BlockSerializer();
    $blocks = [
      [
        'blockName' => 'core/paragraph',
        'innerContent' => ['<p>A test paragraph</p>'],
        'attrs' => [],
        'innerBlocks' => [],
      ], [
        'blockName' => 'core/list',
        'innerContent' => ['<p>Another test paragraph</p>'],
        'attrs' => [],
        'innerBlocks' => [],
      ],
      [
        'blockName' => 'core/group',
        'attrs' => [],
        'innerContent' => [null, null],
        'innerBlocks' => [
          [
            'blockName' => 'custom/figure',
            'innerContent' => [],
            'attrs' => [
              'caption' => 'This is the caption',
              'mediaEntityIds' => [$media->id()],
            ],
            'innerBlocks' => [],
          ], [
            'blockName' => 'custom/columns',
            'innerContent' => [null, null],
            'attrs' => [],
            'innerBlocks' => [
              [
                'blockName' => 'core/paragraph',
                'innerContent' => ['<p>First column</p>'],
                'attrs' => [],
                'innerBlocks' => [],
              ],
              [
                'blockName' => 'core/paragraph',
                'innerContent' => ['<p>Second column</p>'],
                'attrs' => [],
                'innerBlocks' => [],
              ],
            ],
          ]
        ],
      ]];

    $html = $serializer->serialize_blocks($blocks);

    $node = Node::create([
      'type' => 'page',
      'title' => 'Editor test',
      'body' => $html,
    ]);
    $node->addTranslation('de',
      [
        'type' => 'page',
        'title' => 'Editor test DE',
        'body' => $html,
      ]
    )->save();
    $node->save();

    $query = $this->getQueryFromFile('editor.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['static:language:de']);
    $metadata->addCacheTags(['node:1', 'media:1']);
    $this->assertResults($query, ['id' => '1:en'], [
      'en' => [
        'title' => 'Editor test',
        'content' => [
          [
            '__typename' => 'Text',
            'content' => '<p>A test paragraph</p><p>Another test paragraph</p>',
          ],
          [
            '__typename' => 'Figure',
            'caption' => 'This is the caption',
            'image' => [
              'alt' => 'Screaming hairy armadillo'
            ],
          ],
          [
            '__typename' => 'Columns',
            'columns' => [
              [
                '__typename' => 'Text',
              ],
            ],
          ],
        ],
      ],
      'de' => [
        'title' => 'Editor test DE',
        'content' => [
          [
            '__typename' => 'Text',
            'content' => '<p>A test paragraph</p><p>Another test paragraph</p>',
          ],
          [
            '__typename' => 'Figure',
            'caption' => 'This is the caption',
            'image' => [
              'alt' => 'Screaming hairy armadillo DE'
            ],
          ],
          [
            '__typename' => 'Columns',
            'columns' => [
              [
                '__typename' => 'Text',
              ],
            ],
          ],
        ],
      ],
    ], $metadata);
  }

}
