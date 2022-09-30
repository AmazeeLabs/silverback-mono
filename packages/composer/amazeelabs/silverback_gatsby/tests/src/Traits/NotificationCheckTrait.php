<?php

namespace Drupal\Tests\silverback_gatsby\Traits;

use GuzzleHttp\Client;
use Prophecy\Argument;

trait NotificationCheckTrait {

  /**
   * @var \Prophecy\Prophecy\ObjectProphecy
   */
  protected $clientProphecy;

  protected function setupClientProphecy() {
    $this->clientProphecy = $this->prophesize(Client::class);
    $this->container->set('http_client', $this->clientProphecy->reveal());
  }

  protected function checkTotalNotifications(int $number) {
    $this->clientProphecy->post(Argument::any(), Argument::any())->shouldHaveBeenCalledTimes($number);
  }

  protected function checkBuildNotification(string $url, int $buildId) {
    $this->clientProphecy->post(Argument::exact($url), Argument::exact([
      'headers' => [
        'User-Agent' => 'CMS',
      ],
      'json' => ['buildId' => $buildId],
      'timeout' => 2,
    ]))->shouldHaveBeenCalledTimes(1);
  }
}
