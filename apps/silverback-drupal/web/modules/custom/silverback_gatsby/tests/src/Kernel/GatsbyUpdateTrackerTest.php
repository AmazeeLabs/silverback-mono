<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\silverback_gatsby\GatsbyUpdate;
use Drupal\Tests\silverback_gatsby\Traits\BuildNotificationCheckTrait;

class GatsbyUpdateTrackerTest extends KernelTestBase {
  use BuildNotificationCheckTrait;

  /**
   * @var string[]
   */
  public static $modules = ['silverback_gatsby'];

  /**
   * @var \Drupal\silverback_gatsby\GatsbyUpdateTracker|object|null
   */
  protected $tracker;

  protected function setUp() : void{
    parent::setUp();
    $this->setupClientProphecy();
    $this->installSchema('silverback_gatsby', ['gatsby_update_log']);
    $this->tracker = $this->container->get('silverback_gatsby.update_tracker');
  }

  public function testNoBuilds() {
    $this->assertEquals(-1, $this->tracker->latestBuild('foo'));
    $this->assertEmpty($this->tracker->diff(1, 2, 'foo'));
    _drupal_shutdown_function();
    $this->checkTotalNotifications(0);
  }

  public function testSingleBuild() {
    $this->tracker->track('foo', 'Page', '1');
    $this->assertEquals(1, $this->tracker->latestBuild('foo'));
    _drupal_shutdown_function();
    $this->checkTotalNotifications(1);
  }

  public function testMultipleBuilds() {
    $this->tracker->track('foo', 'Page', '1');
    $this->tracker->track('foo', 'Page', '2');
    $this->assertEquals(2, $this->tracker->latestBuild('foo'));
    $this->assertEquals([new GatsbyUpdate('Page', '2')],
      $this->tracker->diff(1, 2, 'foo')
    );
  }

  public function testInvalidDiff() {
    $this->tracker->track('foo', 'Page', '1');
    $this->tracker->track('foo', 'Page', '2');

    // If one of the builds does not exist, it returns an empty list.
    // We are not sure about the history then, so we have to run a full rebuild.
    $this->assertEquals([],
      $this->tracker->diff(0, 2, 'foo')
    );

    $this->assertEquals([],
      $this->tracker->diff(1, 3, 'foo')
    );

    $this->assertEquals([],
      $this->tracker->diff(0, 4, 'foo')
    );

    // In reverse order it will return an empty list too.
    $this->assertEquals([],
      $this->tracker->diff(2, 1, 'foo')
    );
  }

  public function testMultipleServers() {
    $this->tracker->track('foo', 'Page', '1');
    $this->tracker->track('foo', 'Page', '2');
    $this->tracker->track('bar', 'Page', '1');
    $this->tracker->track('bar', 'Page', '3');

    $this->assertEquals(2, $this->tracker->latestBuild('foo'));
    $this->assertEquals(4, $this->tracker->latestBuild('bar'));

    $this->assertEquals([
      new GatsbyUpdate('Page', '2')
    ], $this->tracker->diff(1, 2, 'foo'));

    $this->assertEquals([], $this->tracker->diff(1, 2, 'bar'));

    $this->assertEquals([
      new GatsbyUpdate('Page', '3')
    ], $this->tracker->diff(3, 4, 'bar'));
  }
}
