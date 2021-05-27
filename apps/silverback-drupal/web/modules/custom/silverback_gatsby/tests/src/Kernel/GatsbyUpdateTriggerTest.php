<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\Core\Messenger\MessengerInterface;
use Drupal\KernelTests\KernelTestBase;
use Drupal\Tests\silverback_gatsby\Traits\BuildNotificationCheckTrait;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;
use Prophecy\Argument;

class GatsbyUpdateTriggerTest extends KernelTestBase {
  use BuildNotificationCheckTrait;

  /**
   * @var string[]
   */
  public static $modules = ['silverback_gatsby'];

  /**
   * @var \Prophecy\Prophecy\ObjectProphecy
   */
  protected $messengerProphecy;

  /**
   * @var \Drupal\silverback_gatsby\GatsbyUpdateTrigger
   */
  protected $trigger;

  protected function setUp() : void {
    parent::setUp();
    $this->setupClientProphecy();
    $this->messengerProphecy = $this->prophesize(MessengerInterface::class);
    $this->container->set('messenger', $this->messengerProphecy->reveal());
    $this->trigger = $this->container->get('silverback_gatsby.update_trigger');
  }

  public function testBeforeShutdown() {
    $this->trigger->trigger('foo', 1);
    // If _drupal_shutdown_function() is not called, no notifications go out.
    $this->checkTotalNotifications(0);
  }

  public function testRequestException() {
    $this->clientProphecy->post(Argument::any(), Argument::any())
      ->willThrow(new RequestException('Invalid!', new Request('post', 'http://localhost:8888/__refresh')));
    $this->trigger->trigger('foo', 1);
    _drupal_shutdown_function();
    $this->messengerProphecy->addError(Argument::any())->shouldHaveBeenCalledTimes(2);
    $this->messengerProphecy->addError('Invalid!')->shouldHaveBeenCalledTimes(1);
    $this->messengerProphecy->addError('Could not send build notification to server "foo".')->shouldHaveBeenCalledTimes(1);
  }

  public function testSingleTrigger() {
    $this->trigger->trigger('foo', 1);
    _drupal_shutdown_function();
    $this->checkTotalNotifications(1);
    $this->checkNotification('http://localhost:8000/__refresh', 1);
  }

  public function testMultipleTriggers() {
    $this->trigger->trigger('foo', 1);
    $this->trigger->trigger('foo', 2);
    _drupal_shutdown_function();
    $this->checkTotalNotifications(1);
    $this->checkNotification('http://localhost:8000/__refresh', 2);
  }

  public function testMultipleServers() {
    $this->trigger->trigger('foo', 1);
    $this->trigger->trigger('bar', 2);
    _drupal_shutdown_function();
    $this->checkTotalNotifications(2);
    $this->checkNotification('http://localhost:8000/__refresh', 1);
    $this->checkNotification('http://localhost:8000/__refresh', 2);
  }

  public function testHookUrl() {
    putenv("GATSBY_BUILD_HOOK_FOO=http://localhost:9000/__refresh");
    $this->trigger->trigger('foo', 1);
    _drupal_shutdown_function();
    $this->checkTotalNotifications(1);
    $this->checkNotification('http://localhost:9000/__refresh', 1);
  }

  public function testMultipleHookUrls() {
    putenv("GATSBY_BUILD_HOOK_FOO=http://localhost:9000/__refresh;http://localhost:9001/__refresh");
    $this->trigger->trigger('foo', 1);
    _drupal_shutdown_function();
    $this->checkTotalNotifications(2);
    $this->checkNotification('http://localhost:9000/__refresh', 1);
    $this->checkNotification('http://localhost:9001/__refresh', 1);
  }

  public function testWeirdServerName() {
    putenv("GATSBY_BUILD_HOOK_FOO_BAR_BAZ123=http://localhost:9000/__refresh;http://localhost:9001/__refresh");
    $this->trigger->trigger('foo-bar_baz123', 1);
    _drupal_shutdown_function();
    $this->checkTotalNotifications(2);
    $this->checkNotification('http://localhost:9000/__refresh', 1);
    $this->checkNotification('http://localhost:9001/__refresh', 1);
  }

}
