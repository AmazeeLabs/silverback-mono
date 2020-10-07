<?php

namespace Drupal\Tests\Cypress;

use Drupal\cypress\Cypress;
use Drupal\cypress\CypressOptions;
use Drupal\cypress\CypressRuntimeInterface;
use Drupal\cypress\NpmProjectManagerInterface;
use Drupal\cypress\ProcessManagerInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\Prophecy\ObjectProphecy;

class CypressTest extends UnitTestCase {

  /**
   * @var \Drupal\cypress\Cypress
   */
  protected $cypress;

  /**
   * @var string[]
   */
  protected $options;

  /**
   * @var ObjectProphecy<ProcessManagerInterface>
   */
  protected $processManager;

  protected function setUp(): void {
    parent::setUp();
    $this->processManager = $this->prophesize(ProcessManagerInterface::class);
    $npmProjectManager = $this->prophesize(NpmProjectManagerInterface::class);
    $cypressRuntime = $this->prophesize(CypressRuntimeInterface::class);

    $this->cypress = new Cypress(
      $this->processManager->reveal(),
      $npmProjectManager->reveal(),
      $cypressRuntime->reveal(),
      '/app',
      '/app',
      '/app/drupal-cypress-environment',
      [
        'a' => '/app/tests/a',
        'b' => '/app/tests/b',
      ],
      'drush'
    );

    $this->options = [
      'tags' => 'foo',
      'spec' => 'bar',
      'appRoot' => '/app',
      'drush' => 'drush',
    ];

    $cypressOptions = new CypressOptions($this->options);

    $npmProjectManager->ensureInitiated()->shouldBeCalledOnce();
    $npmProjectManager->merge(realpath(__DIR__ . '/../../package.json'))->shouldBeCalledOnce();

    $cypressRuntime->initiate($cypressOptions)->shouldBeCalledOnce();
    $cypressRuntime->addSuite('a', '/app/tests/a')->shouldBeCalledOnce();
    $cypressRuntime->addSuite('b', '/app/tests/b')->shouldBeCalledOnce();
  }

  public function testCypressRun(): void {
    $this->processManager->run(
      ['/app/node_modules/.bin/cypress', 'run', '--spec', 'bar'],
      '/app/drupal-cypress-environment',
      Cypress::ENVIRONMENT_VARIABLES
    )->shouldBeCalledOnce();
    $this->cypress->run($this->options);
  }

  public function testCypressOpen(): void {
    $this->processManager->run(
      ['/app/node_modules/.bin/cypress', 'open', '--spec', 'bar'],
      '/app/drupal-cypress-environment',
      Cypress::ENVIRONMENT_VARIABLES
    )->shouldBeCalledOnce();
    $this->cypress->open($this->options);
  }
}
