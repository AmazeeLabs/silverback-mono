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
          'pathFieldName' => 'path',
          'templateFieldName' => null,

      ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  [],
          'pathFieldName' => 'path',
          'templateFieldName' => 'template',
        ],
        [
          'typeName' => 'MainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadMainMenu',
          'listFieldName' => 'queryMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'VisibleMainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadVisibleMainMenu',
          'listFieldName' => 'queryVisibleMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
      ],
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testInitialBuild() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'status' => 0,
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
          'pathFieldName' => 'path',
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'Post',
          'translatable' => null,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  [],
          'pathFieldName' => 'path',
          'templateFieldName' => 'template',
        ],
        [
          'typeName' => 'MainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadMainMenu',
          'listFieldName' => 'queryMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'VisibleMainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadVisibleMainMenu',
          'listFieldName' => 'queryVisibleMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
      ],
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testMultipleBuilds() {
    $tracker = $this->container->get('silverback_gatsby.update_tracker');
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'status' => 0,
    ]);
    $node->save();
    $tracker->clear();
    $node->title = 'Changed';
    $node->save();
    $tracker->clear();

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
          'pathFieldName' => 'path',
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  [],
          'pathFieldName' => 'path',
          'templateFieldName' => 'template',
        ],
        [
          'typeName' => 'MainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadMainMenu',
          'listFieldName' => 'queryMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'VisibleMainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadVisibleMainMenu',
          'listFieldName' => 'queryVisibleMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
      ],
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testChanges() {
    $tracker = $this->container->get('silverback_gatsby.update_tracker');
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'status' => 0,
    ]);
    $node->save();
    $tracker->clear();
    $node->title = 'Changed';
    $node->save();
    $tracker->clear();

    Node::create([
      'type' => 'blog',
      'title' => 'Test',
      'status' => 0,
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
          'pathFieldName' => 'path',
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  ['2'],
          'pathFieldName' => 'path',
          'templateFieldName' => 'template',
        ],
        [
          'typeName' => 'MainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadMainMenu',
          'listFieldName' => 'queryMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'VisibleMainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadVisibleMainMenu',
          'listFieldName' => 'queryVisibleMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
      ],
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
          'pathFieldName' => 'path',
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  [],
          'pathFieldName' => 'path',
          'templateFieldName' => 'template',
        ],
        [
          'typeName' => 'MainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadMainMenu',
          'listFieldName' => 'queryMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'VisibleMainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadVisibleMainMenu',
          'listFieldName' => 'queryVisibleMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
      ],
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
          'pathFieldName' => 'path',
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'Post',
          'translatable' => false,
          'singleFieldName' => 'loadPost',
          'listFieldName' => 'queryPosts',
          'changes' =>  ['2'],
          'pathFieldName' => 'path',
          'templateFieldName' => 'template',
        ],
        [
          'typeName' => 'MainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadMainMenu',
          'listFieldName' => 'queryMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
        [
          'typeName' => 'VisibleMainMenu',
          'translatable' => false,
          'singleFieldName' => 'loadVisibleMainMenu',
          'listFieldName' => 'queryVisibleMainMenus',
          'changes' =>  [],
          'pathFieldName' => null,
          'templateFieldName' => null,
        ],
      ],
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }
}
