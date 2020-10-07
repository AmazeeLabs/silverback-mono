<?php

namespace Drupal\Tests\cypress\Kernel;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\cypress\CypressRootFactory;
use Drupal\cypress\CypressTestDirectoriesFactory;
use Drupal\KernelTests\KernelTestBase;

class CypressPathsTest extends KernelTestBase {
  public static $modules = ['cypress'];

  /**
   * {@inheritdoc}
   *
   * @return void
   */
  public function register(ContainerBuilder $container) {
    parent::register($container);
    $modulePath = realpath(__DIR__ . '/../..');
    $container->setParameter('cypress.test_suites', [
      'features' => $modulePath . '/tests/features',
    ]);
  }

  /**
   * @return void
   */
  public function testCypressRoot() {
    /** @var string $appRoot */
    $appRoot = $this->container->get('app.root');
    $this->assertEquals(
      $appRoot . '/' . CypressRootFactory::CYPRESS_ROOT_DIRECTORY,
      $this->container->get('cypress.root')
    );
  }

  /**
   * @return void
   */
  public function testCypressTestDirectories() {
    /** @var string $appRoot */
    $appRoot = $this->container->get('app.root');
    $modulePath = drupal_get_path('module', 'cypress');
    $this->assertEquals(
      [
        'cypress' => $appRoot . '/' . $modulePath . '/' . CypressTestDirectoriesFactory::CYPRESS_TEST_DIRECTORY,
        'features' => realpath($appRoot . '/' . $modulePath . '/tests/features'),
      ],
      $this->container->get('cypress.test_directories')
    );
  }
}
