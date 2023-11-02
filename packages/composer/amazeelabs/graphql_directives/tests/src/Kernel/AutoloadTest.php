<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use Drupal\Tests\graphql_directives\Traits\GraphQLDirectivesTestTrait;

/**
 * Kernel test case for autoloaded directives.
 */
class AutoloadTest extends GraphQLTestBase {
  use GraphQLDirectivesTestTrait;

  public static $modules = [
    'graphql_directives',
    'graphql_directives_test',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() : void {
    parent::setUp();
    $this->setupDirectableSchema(__DIR__ . '/../../assets/autoload');
  }

  /**
   * Test execution of a static class value.
   */
  public function testStaticValue() : void {
    $this->assertResults('{ static }', [], ['static' => 'static value']);
  }

  /**
   *
   */
  public function testContainerValue() : void {
    $this->assertResults('{ service }', [], ['service' => 'container value']);
  }

}
