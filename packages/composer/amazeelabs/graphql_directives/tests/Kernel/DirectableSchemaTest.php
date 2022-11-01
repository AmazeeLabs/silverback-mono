<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\graphql\Entity\Server;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

class DirectableSchemaTest extends GraphQLTestBase {

  public static $modules = [
    'graphql_directives',
    'graphql_directives_test',
  ];

  protected function setUp(): void {
    parent::setUp();
    $this->installConfig('graphql_directives');

    $path = \Drupal::moduleHandler()->getModule('graphql_directives')->getPath();
    $directives = $this->container->get('graphql_directives.printer')
      ->printDirectives();

    file_put_contents(
      $path . '/tests/assets/directives.graphqls',
      $directives
    );

    $this->server = Server::create([
      'status' => true,
      'name' => 'directives_test',
      'label' => 'Directives Test',
      'endpoint'=> '/graphql/directives-test',
      'schema' => 'directable',
      'schema_configuration'=> [
        'directable' => [
          'schema_definition' => __DIR__ . '/../assets/schema.graphqls',
          'extensions' => ['test_directable' => 'test_directable']
        ],
      ],
    ]);
  }

  function testSchemaLoading() {
    $this->assertResults('{ foo }', [], ['foo' => 'bar']);
  }

  function testSeekDirective() {
    $this->assertResults('{ seek }', [], ['seek' => 'two']);
  }

  function testPropDirective() {
    $this->assertResults('{ prop }', [], ['prop' => 'bar']);
  }

  function testMapDirective() {
    $this->assertResults('{ map }', [], ['map' => ['a', 'b']]);
  }

  function testUnion() {
    $this->assertResults(
      '{ union { ... on A { y } ... on B { z } } }', [],
      ['union' => [['y' => 'A'], ['z' => 'B']]]
    );
  }

  function testInterface() {
    $this->assertResults(
      '{ interface { ... on A { y } ... on B { z } } }', [],
      ['interface' => [['y' => 'A'], ['z' => 'B']]]
    );
  }

  function testExtension() {
    $this->assertResults('{ listArticle { title } }', [], [
      'listArticle' => [
        ['title' => 'One'],
        ['title' => 'Two'],
      ],
    ]);
  }
}
