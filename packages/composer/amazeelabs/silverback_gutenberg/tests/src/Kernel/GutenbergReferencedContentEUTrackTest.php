<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\user\Entity\User;

/**
 * @requires module entity_usage
 */
class GutenbergReferencedContentEUTrackTest extends KernelTestBase {
  use ContentTypeCreationTrait;

  protected static $modules = [
    'node',
    'path_alias',
    'system',
    'user',
    'field',
    'text',
    'silverback_gutenberg',
    'entity_usage'
  ];

  /* @var \Drupal\entity_usage\EntityUsageTrackInterface */
  protected $referencedContentPlugin;

  /* @var \Drupal\node\NodeInterface[] */
  protected $targetNodes = [];

  /* @var \Drupal\node\NodeInterface[]*/
  protected $targetUsers = [];

  /**
   * {@inheritDoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installEntitySchema('path_alias');
    $this->installConfig('node');

    $this->createContentType([
      'type' => 'page',
      'name' => 'Basic page'
    ]);

    $this->targetNodes[0] = Node::create([
      'title' => 'EU Test node1',
      'type' => 'page',
    ]);
    $this->targetNodes[0]->save();
    $this->targetNodes[1] = Node::create([
      'title' => 'EU Test node2',
      'type' => 'page',
    ]);
    $this->targetNodes[1]->save();
    $this->targetNodes[2] = Node::create([
      'title' => 'EU Test node3',
      'type' => 'page',
    ]);
    $this->targetNodes[2]->save();

    $this->targetUsers[0] = User::create([
      'name' => 'user1',
    ]);
    $this->targetUsers[0]->save();

    $this->referencedContentPlugin = \Drupal::service('plugin.manager.entity_usage.track')->createInstance('gutenberg_referenced_content');
  }

  /**
   * @covers \Drupal\silverback_gutenberg\Plugin\EntityUsage\Track\GutenbergReferencedContent::getTargetEntities
   */
  public function testGetTargetEntities() {
    // Content with no references.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root"><!-- wp:paragraph --><p>Content with no internal references</p><!-- /wp:paragraph --></main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = [];
    $this->assertEquals($expected, $targetEntities);

    // One single root block, with a node reference.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root"><!-- wp:custom/link-item {"title":"test","uuid":"' . $this->targetNodes[0]->uuid() . '","entityType":"node"} -->
<!-- /wp:custom/link-item --></main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = ['node|' . $this->targetNodes[0]->id()];
    $this->assertEquals($expected, $targetEntities);

    // One single root block with an array of node uuids.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root"><!-- wp:custom/link-item {"title":"test","uuid":["' . $this->targetNodes[0]->uuid() . '","' . $this->targetNodes[1]->uuid() . '"],"entityType":"node"} -->
<!-- /wp:custom/link-item --></main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = [
      'node|' . $this->targetNodes[0]->id(),
      'node|' . $this->targetNodes[1]->id()
    ];
    $this->assertEquals($expected, $targetEntities);

    // More root blocks with the same entity type.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root">
<!-- wp:custom/link-item {"title":"test","uuid":"' . $this->targetNodes[0]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item -->
<!-- wp:custom/link-item {"title":"one more test","uuid":"' . $this->targetNodes[1]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item -->
</main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = [
      'node|' . $this->targetNodes[0]->id(),
      'node|' . $this->targetNodes[1]->id()
    ];
    $this->assertEquals($expected, $targetEntities);

    // Multiple root block with inner blocks, referencing one entity type.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root">
<!-- wp:custom/link-item {"title":"test","uuid":"' . $this->targetNodes[0]->uuid() . '","entityType":"node"} -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetNodes[1]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item-inner -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetNodes[0]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item-inner -->
<!-- /wp:custom/link-item -->
<!-- wp:custom/link-item {"title":"last","uuid":"' . $this->targetNodes[2]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item -->
</main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = [
      'node|' . $this->targetNodes[0]->id(),
      'node|' . $this->targetNodes[1]->id(),
      'node|' . $this->targetNodes[2]->id()
    ];
    $this->assertEquals($expected, $targetEntities);

    // Multiple blocks referencing different entity types.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root">
<!-- wp:custom/link-item {"title":"test","uuid":"' . $this->targetUsers[0]->uuid() . '","entityType":"user"} -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetNodes[0]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item-inner -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetNodes[1]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item-inner -->
<!-- /wp:custom/link-item -->
</main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = [
      'user|' . $this->targetUsers[0]->id(),
      'node|' . $this->targetNodes[0]->id(),
      'node|' . $this->targetNodes[1]->id()
    ];
    $this->assertEquals($expected, $targetEntities);

    // Multiple blocks, one of them not having the entityType attribute set.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root">
<!-- wp:custom/link-item {"title":"test","uuid":"' . $this->targetNodes[0]->uuid() . '"} -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetNodes[1]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item-inner -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetNodes[2]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item-inner -->
<!-- /wp:custom/link-item -->
</main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = [
      'node|' . $this->targetUsers[0]->id(),
      'node|' . $this->targetNodes[1]->id(),
      'node|' . $this->targetNodes[2]->id()
    ];
    $this->assertEquals($expected, $targetEntities);

    // Multiple blocks, one of them not having the uuid attribute set.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root">
<!-- wp:custom/link-item {"title":"test","entityType":"node"} -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetNodes[0]->uuid() . '","entityType":"node"} --><!-- /wp:custom/link-item-inner -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetUsers[0]->uuid() . '","entityType":"user"} --><!-- /wp:custom/link-item-inner -->
<!-- /wp:custom/link-item -->
</main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = [
      'node|' . $this->targetNodes[0]->id(),
      'user|' . $this->targetUsers[0]->id(),
    ];
    $this->assertEquals($expected, $targetEntities);

    // Invalid uuids.
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<!-- wp:custom/root --><main class="wp-block-custom-root">
<!-- wp:custom/link-item {"title":"test","uuid":"' . $this->targetNodes[0]->uuid() . '","entityType":"node"} -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"invalid","entityType":"node"} --><!-- /wp:custom/link-item-inner -->
  <!-- wp:custom/link-item-inner {"title":"inner","uuid":"' . $this->targetUsers[0]->uuid() . '","entityType":"user"} --><!-- /wp:custom/link-item-inner -->
<!-- /wp:custom/link-item -->
</main><!-- /wp:custom/root -->',
    ])->get('body')[0];
    $targetEntities = $this->referencedContentPlugin->getTargetEntities($fieldItem);
    $expected = [
      'node|' . $this->targetNodes[0]->id(),
      'user|' . $this->targetUsers[0]->id(),
    ];
    $this->assertEquals($expected, $targetEntities);
  }
}
