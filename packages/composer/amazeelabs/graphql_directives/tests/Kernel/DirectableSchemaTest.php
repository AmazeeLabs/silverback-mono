<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\graphql\Entity\Server;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

class DirectableSchemaTest extends GraphQLTestBase {

  public static $modules = ['graphql_directives'];

  protected function setUp(): void {
    parent::setUp();
    $this->installConfig('graphql_directives');
    $this->server = Server::create([
      'status' => true,
      'name' => 'directives_test',
      'label' => 'Directives Test',
      'endpoint'=> '/graphql/directives-test',
      'schema' => 'directable',
      'schema_configuration'=> [
        'directable' => ['schema_definition' => __DIR__ . '/../assets/schema.graphqls'],
      ],
    ]);
  }

  function testSchemaLoading() {
    $this->assertResults('{ foo }', [], ['foo' => null]);
  }
}
