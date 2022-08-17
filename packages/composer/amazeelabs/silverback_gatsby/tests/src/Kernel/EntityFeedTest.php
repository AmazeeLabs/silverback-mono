<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\node\Entity\Node;
use Drupal\path_alias\Entity\PathAlias;
use Drupal\Tests\Traits\Core\PathAliasTestTrait;
use GraphQL\Server\OperationParams;

class EntityFeedTest extends EntityFeedTestBase {
  use PathAliasTestTrait;

  public static $modules = ['path_alias'];

  public function setUp(): void {
    parent::setUp();
    $this->installEntitySchema('path_alias');

    // For some reason, the path alias processor is not registered within the
    // kernel test setup, so we have to manually register it.
    /** @var \Drupal\Core\PathProcessor\InboundPathProcessorInterface $aliasProcessor */
    $aliasProcessor = \Drupal::service('path_alias.path_processor');
    /** @var \Drupal\Core\PathProcessor\PathProcessorManager $pathProcessorManager */
    $pathProcessorManager = \Drupal::service('path_processor_manager');
    $pathProcessorManager->addInbound($aliasProcessor);
  }

  public function testUntranslatableEntity() {
    $node = Node::create([
      'type' => 'blog',
      'title' => 'Test'
    ]);
    $node->save();

    $query = $this->getQueryFromFile('untranslatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view']);
    $metadata->addCacheTags(['node:1', 'node_list']);
    $this->assertResults($query, [], [
      'loadPost' => [
        'title' => 'Test',
      ],
      'queryPosts' => [
        [
          'id' => '1',
          'drupalId' => '1',
          'title' => 'Test',
        ],
      ],
    ], $metadata);
  }

  public function testTranslatableEntity() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test'
    ]);
    $node->save();

    $query = $this->getQueryFromFile('translatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view', 'static:language:en']);
    $metadata->addCacheTags(['node:1', 'node_list']);
    $this->assertResults($query, ['id' => '1:en'], [
      'loadPage' => [
        'title' => 'Test',
      ],
      'queryPages' => [
        [
          'id' => '1:en',
          'drupalId' => '1',
          'translations' => [
            [
              'defaultTranslation' => true,
              'langcode' => 'en',
              'title' => 'Test',
            ],
          ],
        ],
      ],
    ], $metadata);
  }

  public function testLanguageNotApplicable() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'langcode' => 'zxx',
    ]);
    $node->save();

    $query = $this->getQueryFromFile('translatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view']);
    $metadata->addCacheTags(['node:1', 'node_list']);
    $this->assertResults($query, ['id' => '1:zxx'], [
      'loadPage' => [
        'title' => 'Test',
      ],
      'queryPages' => [
        [
          'id' => '1:zxx',
          'drupalId' => '1',
          'translations' => [
            [
              'defaultTranslation' => true,
              'langcode' => 'zxx',
              'title' => 'Test',
            ],
          ],
        ],
      ],
    ], $metadata);
  }

  public function testLanguageNotSpecified() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'langcode' => 'und',
    ]);
    $node->save();

    $query = $this->getQueryFromFile('translatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view']);
    $metadata->addCacheTags(['node:1', 'node_list']);
    $this->assertResults($query, ['id' => '1:und'], [
      'loadPage' => [
        'title' => 'Test',
      ],
      'queryPages' => [
        [
          'id' => '1:und',
          'drupalId' => '1',
          'translations' => [
            [
              'defaultTranslation' => true,
              'langcode' => 'und',
              'title' => 'Test',
            ],
          ],
        ],
      ],
    ], $metadata);
  }

  public function testAccessDenied() {
    $node = Node::create([
      'type' => 'page',
      // A custom entity access hook in silverback_gatsby_example will make
      // entities with this label inaccessible.
      'title' => 'Access denied',
    ]);
    $node->save();

    $query = $this->getQueryFromFile('translatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view']);
    $metadata->addCacheTags(['node:1', 'node_list']);
    $this->assertResults($query, ['id' => '1:en'], [
      'loadPage' => null,
      'queryPages' => [
        null
      ],
    ], $metadata);
  }

  public function testDeletedTranslation() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'English',
    ]);
    $node->save();
    $node->addTranslation('de', ['title' => 'German'])->save();
    $node->removeTranslation('de');
    $node->save();

    $query = $this->getQueryFromFile('translatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view', 'static:language:en']);
    $metadata->addCacheTags(['node:1', 'node_list']);
    $this->assertResults($query, ['id' => '1:de'], [
      'loadPage' => null,
      'queryPages' => [
        [
          'id' => '1:en',
          'drupalId' => '1',
          'translations' => [
            [
              'defaultTranslation' => true,
              'langcode' => 'en',
              'title' => 'English',
            ],
          ],
        ],
      ],
    ], $metadata);
  }

  public function testUnpublishedTranslation() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'English',
    ]);
    $node->save();
    $node->addTranslation('de', ['title' => 'German', 'status' => 0])->save();

    $query = $this->getQueryFromFile('translatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view', 'static:language:en', 'static:language:de']);
    $metadata->addCacheTags(['node:1', 'node_list']);
    $this->assertResults($query, ['id' => '1:de'], [
      'loadPage' => null,
      'queryPages' => [
        [
          'id' => '1:en',
          'drupalId' => '1',
          'translations' => [
            [
              'defaultTranslation' => true,
              'langcode' => 'en',
              'title' => 'English',
            ],
          ],
        ],
      ],
    ], $metadata);
  }

  public function testUnpublishedSource() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'English',
      'status' => 0,
    ]);
    $node->save();
    $node->addTranslation('de', ['title' => 'German', 'status' => 1])->save();

    $query = $this->getQueryFromFile('translatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view', 'static:language:de', 'static:language:en']);
    $metadata->addCacheTags(['node:1', 'node_list']);

    $this->assertResults($query, ['id' => '1:de'], [
      'loadPage' => [
        "title" => "German"
      ],
      'queryPages' => [
        [
          'id' => '1:de',
          'drupalId' => '1',
          'translations' => [
            [
              'defaultTranslation' => false,
              'langcode' => 'de',
              'title' => 'German',
            ]
          ],
        ],
      ],
    ], $metadata);

    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['user.node_grants:view', 'static:language:de', 'static:language:en']);
    $metadata->addCacheTags(['node:1', 'node_list']);
    $this->assertResults($query, ['id' => '1:en'], [
      'loadPage' => null,
      'queryPages' => [
        [
          'id' => '1:de',
          'drupalId' => '1',
          'translations' => [
            [
              'defaultTranslation' => false,
              'langcode' => 'de',
              'title' => 'German',
            ]
          ],
        ],
      ],
    ], $metadata);
  }

  public function testCreatePageFields() {
    $regular = Node::create([
      'type' => 'blog',
      'title' => 'Regular',
      'promote' => 0,
    ]);
    $regular->save();
    $promoted = Node::create([
      'type' => 'blog',
      'title' => 'Promoted',
      'promote' => 1,
    ]);
    $promoted->save();

    $query = $this->getQueryFromFile('create-page-fields.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['node:1', 'node:2']);
    $this->assertResults($query, [], [
      'regular' => [
        'title' => 'Regular',
        'path' => '/node/1',
        'template' => null,
      ],
      'promoted' => [
        'title' => 'Promoted',
        'path' => '/node/2',
        'template' => 'blog-promoted',
      ],
    ], $metadata);
  }

  public function testRevisionable() {
    $node = Node::create([
      'type' => 'blog',
      'title' => 'Revision 1'
    ]);
    $node->save();
    $node->set('title', 'Revision 2');
    $node->setNewRevision();
    $node->save();

    $query = $this->getQueryFromFile('revisionable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['node:1']);
    $this->assertResults($query, [], [
      'a' => [
        'title' => 'Revision 1',
      ],
      'b' => [
        'title' => 'Revision 2',
      ],
    ], $metadata);
  }

  public function testMultilingualRevisionable() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Revision 1'
    ]);
    $node->save();
    $node->setNewRevision();
    $translation = $node->addTranslation('de', ['title' => 'Revision 1 German', 'status' => 1]);
    $translation->save();


    $translation->set('title', 'Revision 2 German');
    $translation->setNewRevision();
    $translation->save();

    $query = $this->getQueryFromFile('revisionable-translatable.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['node:1']);
    $metadata->addCacheContexts(['static:language:de']);
    $this->assertResults($query, [], [
      'a' => [
        'title' => 'Revision 1',
      ],
      'b' => null,
      'c' => [
        'title' => 'Revision 1 German',
      ],
      'd' => [
        'title' => 'Revision 2 German',
      ],
    ], $metadata);
  }

  public function testLoadById() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test page'
    ]);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['node:1']);
    $query = $this->getQueryFromFile('load-entity.gql');
    $this->assertResults($query, ['input' => '1:en'], [
      'loadPage' => [
        'title' => 'Test page',
      ],
    ], $metadata);
  }

  public function testLoadByUuid() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test page'
    ]);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['node:1']);
    $query = $this->getQueryFromFile('load-entity.gql');
    $this->assertResults($query, ['input' => $node->uuid() . ':en'], [
      'loadPage' => [
        'title' => 'Test page',
      ],
    ], $metadata);
  }

  public function testLoadByInternalPath() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test page'
    ]);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['node:1']);
    $query = $this->getQueryFromFile('load-entity.gql');
    $this->assertResults($query, ['input' => '/node/1:en'], [
      'loadPage' => [
        'title' => 'Test page',
      ],
    ], $metadata);
  }

  public function testLoadByAliasedPath() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test page'
    ]);
    $node->save();
    $this->createPathAlias('/node/1', '/test');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['node:1']);
    $query = $this->getQueryFromFile('load-entity.gql');
    $this->assertResults($query, ['input' => '/test:en'], [
      'loadPage' => [
        'title' => 'Test page',
      ],
    ], $metadata);
  }

}
