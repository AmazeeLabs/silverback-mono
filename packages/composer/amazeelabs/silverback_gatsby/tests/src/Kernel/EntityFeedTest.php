<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\node\Entity\Node;
use GraphQL\Server\OperationParams;

class EntityFeedTest extends EntityFeedTestBase {

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
    $metadata->addCacheContexts(['user.node_grants:view', 'static:language:de']);
    $metadata->addCacheTags(['node:1', 'node_list']);

    $this->assertResults($query, ['id' => '1:de'], [
      'loadPage' => [
        "title" => "German"
      ],
      'queryPages' => [
        null
      ],
    ], $metadata);

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

}
