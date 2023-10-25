<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\node\Entity\Node;
use Drupal\silverback_gatsby\GatsbyUpdate;
use Drupal\silverback_gatsby\GatsbyUpdateTrigger;

class GatsbyUpdateHandlerTest extends EntityFeedTestBase {

  /**
   * @var \Drupal\silverback_gatsby\GatsbyUpdateTracker|object|null
   */
  protected $tracker;

  /**
   * @var \Prophecy\Prophecy\ObjectProphecy
   */
  protected $triggerProphecy;

  public function register(ContainerBuilder $container) {
    parent::register($container);
    $this->triggerProphecy = $this->prophesize(GatsbyUpdateTrigger::class);
    $container->set('silverback_gatsby.update_trigger', $this->triggerProphecy->reveal());
  }

  protected function setUp() : void {
    parent::setUp();
    $this->tracker = $this->container->get('silverback_gatsby.update_tracker');
  }

  public function testLogRelevantChanges() {
    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'status' => 0,
    ]);
    $node->save();
    $this->tracker->clear();

    $node->addTranslation('de', [
      'title' => 'Test DE',
      'status' => 0,
    ])->save();

    $node->setTitle('Test 2');
    $node->save();

    $diff = $this->tracker->diff(1, 3, $this->server->id());
    $this->assertEquals([
      new GatsbyUpdate('Page', $node->uuid() . ':en'),
      new GatsbyUpdate('Page', $node->uuid() . ':de'),
    ], $diff);
  }

  public function testIgnoreIrrelevantChanges() {
    $node = Node::create([
      'type' => 'article',
      'title' => 'Test',
      'status' => 0,
    ]);
    $node->save();
    $node->setTitle('Test 2');
    $node->save();

    $diff = $this->tracker->diff(1, 2, $this->server->id());
    $this->assertEmpty($diff);
  }

  public function testTriggerUpdates() {
    $page = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'status' => 0,
    ]);
    $page->save();

    $article = Node::create([
      'type' => 'article',
      'title' => 'Test',
      'status' => 0,
    ]);
    $article->save();

    $this->triggerProphecy
      ->trigger($this->server->id(), new GatsbyUpdate('Page', $page->uuid() . ':en'))->shouldHaveBeenCalledTimes(1);
  }
}
