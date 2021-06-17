<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\node\Entity\Node;

class GatsbyFeedInfoTest extends EntityFeedTestBase {

  public function testInitialFeed() {
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // When no build happened yet, the build ID is -1
      'drupalBuildId' =>  -1,
      'drupalFeedInfo' => [
        [
          'typeName' => 'Page',
          'translatable' => true,
          'singleFieldName' => 'loadPage',
          'listFieldName' => 'queryPages',
          'changes' =>  [],
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  [],
        ],
      ]
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testInitialBuild() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test'
    ]);
    $node->save();

    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // It should indicate that there has been a first build.
      'drupalBuildId' =>  1,
      'drupalFeedInfo' => [
        [
          'typeName' => 'Page',
          'translatable' => true,
          'singleFieldName' => 'loadPage',
          'listFieldName' => 'queryPages',
          'changes' =>  [],
        ],
        [
          'typeName' => 'Post',
          'translatable' => null,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  [],
        ],
      ]
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testMultipleBuilds() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test'
    ]);
    $node->save();
    $node->title = 'Changed';
    $node->save();

    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      'drupalBuildId' =>  2,
      'drupalFeedInfo' => [
        [
          'typeName' => 'Page',
          'translatable' => true,
          'singleFieldName' => 'loadPage',
          'listFieldName' => 'queryPages',
          'changes' =>  [],
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  [],
        ],
      ]
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testChanges() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test'
    ]);
    $node->save();
    $node->title = 'Changed';
    $node->save();

    Node::create([
      'type' => 'blog',
      'title' => 'Test',
    ])->save();

    $query = $this->getQueryFromFile('feed_info.gql');
    // All changes since build 1. Edited page and created post.
    $this->assertResults($query, [
      'lastBuild' => 1,
      'currentBuild' => 3,
    ], [
      'drupalBuildId' =>  3,
      'drupalFeedInfo' => [
        [
          'typeName' => 'Page',
          'translatable' => true,
          'singleFieldName' => 'loadPage',
          'listFieldName' => 'queryPages',
          'changes' =>  ['1:en'],
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  ['2'],
        ],
      ]
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    // Only the first change that edited the page.
    $this->assertResults($query, [
      'lastBuild' => 1,
      'currentBuild' => 2,
    ], [
      'drupalBuildId' =>  3,
      'drupalFeedInfo' => [
        [
          'typeName' => 'Page',
          'translatable' => true,
          'singleFieldName' => 'loadPage',
          'listFieldName' => 'queryPages',
          'changes' =>  ['1:en'],
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  [],
        ],
      ]
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    // Only the last change that created a blog post.
    $this->assertResults($query, [
      'lastBuild' => 2,
      'currentBuild' => 3,
    ], [
      'drupalBuildId' =>  3,
      'drupalFeedInfo' => [
        [
          'typeName' => 'Page',
          'translatable' => true,
          'singleFieldName' => 'loadPage',
          'listFieldName' => 'queryPages',
          'changes' =>  [],
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  ['2'],
        ],
      ]
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }
}
