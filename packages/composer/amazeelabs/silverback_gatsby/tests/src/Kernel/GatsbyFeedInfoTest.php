<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\node\Entity\Node;

class GatsbyFeedInfoTest extends EntityFeedTestBase {
  protected function expectedFeedInfo($changes = []) {
    return [
      [
        'typeName' => 'Page',
        'translatable' => TRUE,
        'singleFieldName' => 'loadPage',
        'listFieldName' => 'queryPages',
        'changes' => $changes['Page'] ?? [],
        'pathFieldName' => 'path',
        'templateFieldName' => NULL,

      ],
      [
        'typeName' => 'Post',
        'translatable' => FALSE,
        'singleFieldName' => 'loadPost',
        'listFieldName' => 'queryPosts',
        'changes' => $changes['Post'] ?? [],
        'pathFieldName' => 'path',
        'templateFieldName' => 'template',
      ],
      [
        'typeName' => 'MainMenu',
        'translatable' => FALSE,
        'singleFieldName' => 'loadMainMenu',
        'listFieldName' => 'queryMainMenus',
        'changes' => $changes['MainMenu'] ?? [],
        'pathFieldName' => NULL,
        'templateFieldName' => NULL,
      ],
      [
        'typeName' => 'VisibleMainMenu',
        'translatable' => FALSE,
        'singleFieldName' => 'loadVisibleMainMenu',
        'listFieldName' => 'queryVisibleMainMenus',
        'changes' => $changes['VisibleMainMenu'] ?? [],
        'pathFieldName' => NULL,
        'templateFieldName' => NULL,
      ],
    ];
  }

  public function testInitialFeed() {
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // When no build happened yet, the build ID is -1
      'drupalBuildId' =>  -1,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
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
      'drupalFeedInfo' => $this->expectedFeedInfo(),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testInitialPublishedBuild() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
    ]);
    $node->save();


    $this->useBuildServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // It should indicate that there has been a first build.
      'drupalBuildId' =>  1,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    $this->usePreviewServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // It should indicate that there has been a first build.
      'drupalBuildId' =>  2,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    $this->usePublicServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // It should indicate that there has been a first build.
      'drupalBuildId' =>  -1,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
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
    $node->setTitle('Changed');
    $node->save();
    $tracker->clear();

    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      'drupalBuildId' =>  2,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testCurrentBuildArgument() {
    $tracker = $this->container->get('silverback_gatsby.update_tracker');
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'status' => 0,
    ]);
    $node->save();
    $tracker->clear();
    $node->setTitle('Changed');
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
      'drupalFeedInfo' => $this->expectedFeedInfo([
        'Page' => ['1:en'],
        'Post' => ['2'],
      ]),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    // Only the first change that edited the page.
    $this->assertResults($query, [
      'lastBuild' => 1,
      'currentBuild' => 2,
    ], [
      'drupalBuildId' =>  3,
      'drupalFeedInfo' => $this->expectedFeedInfo([
        'Page' => ['1:en'],
      ]),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    // Only the last change that created a blog post.
    $this->assertResults($query, [
      'lastBuild' => 2,
      'currentBuild' => 3,
    ], [
      'drupalBuildId' =>  3,
      'drupalFeedInfo' => $this->expectedFeedInfo([
        'Post' => ['2'],
      ]),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testNodePublish() {
    $tracker = $this->container->get('silverback_gatsby.update_tracker');
    // Create one initial published node so both build and preview server have
    // a build id we can diff against.
    Node::create([
      'type' => 'page',
      'title' => 'Published',
    ])->save();

    // Create the second node that we are actually going to test.
    $node = Node::create([
      'type' => 'page',
      'title' => 'Unpublished',
      'status' => 0,
    ]);
    $node->save();

    $tracker->clear();

    // Preview server should be on build 3 (2 for the initial node on preview
    // & build and 1 for the unpublished node on preview).
    $this->usePreviewServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // It should indicate that there has been a first build.
      'drupalBuildId' =>  3,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    // Preview should be on build 1 which is the initial node.
    $this->useBuildServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // It should indicate that there has been a first build.
      'drupalBuildId' =>  1,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    // Publish the unpublished node.
    // We have to create a new revision, or we get the last cached access result.
    $node->setTitle('Published');
    $node->setPublished();
    $node->save();

    // Build server should be on build 5 now. The 3 from before plus 2 builds
    // for preview and build. "2:en" is marked as a change to be fetched.
    $this->useBuildServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [
      'lastBuild' => 1,
      'currentBuild' => 5,
    ], [
      // It should indicate that there has been a first build.
      'drupalBuildId' => 5,
      'drupalFeedInfo' => $this->expectedFeedInfo(['Page' => ['2:en']]),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }

  public function testNodeUnpublish() {
    // Create an initial published node.
    $tracker = $this->container->get('silverback_gatsby.update_tracker');
    $node = Node::create([
      'type' => 'page',
      'title' => 'Published',
    ]);
    $node->save();

    $tracker->clear();

    // Preview server is on build 2. 1 is for the build server.
    $this->usePreviewServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // It should indicate that there has been a first build.
      'drupalBuildId' =>  2,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    // The build server is on build 1.
    $this->useBuildServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [], [
      // It should indicate that there has been a first build.
      'drupalBuildId' =>  1,
      'drupalFeedInfo' => $this->expectedFeedInfo(),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));

    // Unpublish the node.
    // We have to create a new revision, or we get the last cached access result.
    $node->setTitle('Unpublished');
    $node->setUnpublished();
    $node->save();

    // Build server is on build 3, and '1:en' is marked as changed which will
    // effectively delete it from the gatsby store since the fetch will return
    // null.
    $this->useBuildServer();
    $query = $this->getQueryFromFile('feed_info.gql');
    $this->assertResults($query, [
      'lastBuild' => 1,
      'currentBuild' => 3,
    ], [
      // It should indicate that there has been a first build.
      'drupalBuildId' => 3,
      'drupalFeedInfo' => $this->expectedFeedInfo(['Page' => ['1:en']]),
    ], $this->defaultCacheMetaData()->mergeCacheMaxAge(0));
  }
}
