<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\silverback_gatsby\GatsbyUpdate;

class GatsbyUpdateHandlerTest extends EntityFeedTestBase {

  /**
   * @var \Drupal\silverback_gatsby\GatsbyUpdateTracker|object|null
   */
  protected $tracker;

  protected function setUp() : void {
    parent::setUp();
    $this->tracker = $this->container->get('silverback_gatsby.update_tracker');
  }

  public function testLogRelevantChanges() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test'
    ]);
    $node->save();

    $node->addTranslation('de', [
      'title' => 'Test DE'
    ])->save();

    $node->title = 'Test 2';
    $node->save();

    $diff = $this->tracker->diff(1, 3, $this->server->id());
    $this->assertEquals([
      new GatsbyUpdate('Page', '1:en'),
      new GatsbyUpdate('Page', '1:de'),
    ], $diff);
  }

  public function testIgnoreIrrelevantChanges() {
    $node = Node::create([
      'type' => 'article',
      'title' => 'Test'
    ]);
    $node->save();
    $node->title = 'Test 2';
    $node->save();

    $diff = $this->tracker->diff(1, 2, $this->server->id());
    $this->assertEmpty($diff);
  }
}
