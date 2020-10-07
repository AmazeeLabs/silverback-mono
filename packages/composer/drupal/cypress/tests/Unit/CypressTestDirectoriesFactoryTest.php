<?php

namespace Drupal\Tests\cypress\Unit;

use Drupal\Core\Extension\Extension;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\cypress\CypressTestDirectoriesFactory;
use Drupal\Tests\UnitTestCase;
use org\bovigo\vfs\vfsStream;

class CypressTestDirectoriesFactoryTest extends UnitTestCase {
  public function testCypressTestDirectories(): void {
    $vfs = vfsStream::setup('app');
    $appRoot = vfsStream::create([
      'app' => [
        'modules' => [
          'a' => [],
          'b' => [
            'tests' => [
              'Cypress' => [],
            ],
          ],
        ],
        'features' => [],
        'tests' => [],
        'site' => [
          'testing.services.yml' => 'parameters: { cypress.test_suites: {tests: "tests"}}'
        ]
      ],
    ], $vfs)->url() . '/app';

    $moduleA = $this->prophesize(Extension::class);
    $moduleA->getPath()->willReturn('modules/a');
    $moduleB = $this->prophesize(Extension::class);
    $moduleB->getPath()->willReturn('modules/b');

    $moduleHandler = $this->prophesize(ModuleHandlerInterface::class);
    $moduleHandler->getModuleList()->willReturn([
      'a' => $moduleA->reveal(),
      'b' => $moduleB->reveal(),
    ]);

    $this->assertEquals([
      'b' => $appRoot . '/modules/b/tests/Cypress',
      'features' => $appRoot . '/features',
      'tests' => $appRoot . '/tests',
    ], (new CypressTestDirectoriesFactory($appRoot, $moduleHandler->reveal(), [
      'features' => 'features',
      'idontexist' => 'idontexist',
    ], $appRoot . '/site'))->getDirectories());
  }
}
