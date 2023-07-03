<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\user\Entity\User;

/**
 * @requires module entity_usage
 */
class GutenbergLinkedContentEUTrackTest extends KernelTestBase {
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
  protected $linkedContentPlugin;

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

    $this->targetUsers[0] = User::create([
      'name' => 'user1',
    ]);
    $this->targetUsers[0]->save();

    $this->linkedContentPlugin = \Drupal::service('plugin.manager.entity_usage.track')->createInstance('gutenberg_linked_content');
  }

  /**
   * @covers \Drupal\silverback_gutenberg\Plugin\EntityUsage\Track\GutenbergLinkedContent::getTargetEntities
   */
  public function testGetTargetEntities() {
    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<div>This is a text with <span>no internally referenced</span> <a href="https://www.example.com">content</a>.</div>',
    ])->get('body')[0];
    $targetEntities = $this->linkedContentPlugin->getTargetEntities($fieldItem);
    $expected = [];
    $this->assertEquals($expected, $targetEntities);

    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<div>This is a simple <a href="/" data-id="' . $this->targetNodes[0]->uuid() .'" data-entity-type="node">link</a></div>',
    ])->get('body')[0];
    $targetEntities = $this->linkedContentPlugin->getTargetEntities($fieldItem);
    $expected = ['node|' . $this->targetNodes[0]->id()];
    $this->assertEquals($expected, $targetEntities);

    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<div>This is a <p>node <a href="/" data-id="' . $this->targetNodes[0]->uuid() . '" data-entity-type="node">reference</a>, another node <a href="/" data-id="' . $this->targetNodes[1]->uuid() . '" data-entity-type="node">reference</a></p>,<p>then another duplicated node <a href="/" data-id="' . $this->targetNodes[0]->uuid() . '" data-entity-type="node">reference</a></p> and one user  <a href="/" data-id="' . $this->targetUsers[0]->uuid() . '" data-entity-type="user">reference</a></div>',
    ])->get('body')[0];
    $targetEntities = $this->linkedContentPlugin->getTargetEntities($fieldItem);
    $expected = [
      'node|' . $this->targetNodes[0]->id(),
      'node|' . $this->targetNodes[1]->id(),
      'user|' . $this->targetNodes[0]->id()
    ];
    $this->assertEquals($expected, $targetEntities);

    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<div>This is a node <a href="/" data-id="' . $this->targetNodes[0]->uuid() . '">reference</a> without the data-entity-type attribute</div>',
    ])->get('body')[0];
    $targetEntities = $this->linkedContentPlugin->getTargetEntities($fieldItem);
    $expected = ['node|' . $this->targetNodes[0]->id()];
    $this->assertEquals($expected, $targetEntities);

    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<div>This is a node <a href="/" data-entity-type="node">reference</a> without the data-id attribute</div>',
    ])->get('body')[0];
    $targetEntities = $this->linkedContentPlugin->getTargetEntities($fieldItem);
    $expected = [];
    $this->assertEquals($expected, $targetEntities);

    $fieldItem = Node::create([
      'title' => 'Source node',
      'type' => 'page',
      'body' => '<div>This is an invalid node <a href="/" data-id="invalid-uuid" data-entity-type="node">reference</a></div>',
    ])->get('body')[0];
    $targetEntities = $this->linkedContentPlugin->getTargetEntities($fieldItem);
    $expected = [];
    $this->assertEquals($expected, $targetEntities);
  }
}
