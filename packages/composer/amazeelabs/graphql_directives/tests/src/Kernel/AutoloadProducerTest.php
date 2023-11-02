<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

/**
 * Test cases for the autoload data producer.
 */
class AutoloadProducerTest extends GraphQLTestBase {

  public static $modules = [
    'graphql_directives',
    'graphql_directives_test',
  ];

  /**
   * Execute a static class method.
   */
  public function testStaticValue(): void {
    $result = $this->executeDataProducer('autoload', [
      'service' => NULL,
      'class' => 'Drupal\graphql_directives_test\TestResolvers',
      'method' => 'staticValue',
      'parent' => NULL,
      'args' => [],
    ]);
    $this->assertEquals('static value', $result);
  }

  /**
   * Execute a service class method.
   */
  public function testServiceValue(): void {
    $result = $this->executeDataProducer('autoload', [
      'service' => 'graphql_directives_test.test',
      'class' => NULL,
      'method' => 'containerValue',
      'parent' => NULL,
      'args' => [],
    ]);
    $this->assertEquals('container value', $result);
  }

}
