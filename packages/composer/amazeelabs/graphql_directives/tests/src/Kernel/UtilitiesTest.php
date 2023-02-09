<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\graphql\Entity\Server;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use Drupal\Tests\graphql_directives\Traits\GraphQLDirectivesTestTrait;

class UtilitiesTest extends GraphQLTestBase {
  use GraphQLDirectivesTestTrait;

  public static $modules = [
    'graphql_directives',
    'graphql_directives_test',
  ];

  protected function setUp(): void {
    parent::setUp();
    $this->installConfig('graphql_directives');
    $this->setupDirectableSchema(__DIR__ . '/../../assets/utilities', ['test_directable']);
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
