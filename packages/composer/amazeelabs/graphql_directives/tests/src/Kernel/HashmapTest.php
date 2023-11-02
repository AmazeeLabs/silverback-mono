<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\graphql_directives\GraphQL\Resolvers\Hashmap;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use GraphQL\Deferred;

/**
 *
 */
class HashmapTest extends GraphQLTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['graphql_directives_test'];

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();

    $schema = <<<GQL
      type Query {
        map: Map
      }

      type Map {
        a: String!
        b: String!
        c: String!
      }
GQL;

    $this->setUpSchema($schema);
  }

  /**
   * Hashmap with plain values.
   */
  public function testHashmapPlain(): void {
    $this->mockResolver('Query', 'map', new Hashmap([
      'a' => 'foo',
      'b' => 'bar',
    ])
    );
    $this->assertResults('{ map { a, b } }', [], [
      'map' => [
        'a' => 'foo',
        'b' => 'bar',
      ],
    ]);
  }

  /**
   * Hashmap with resolved values.
   */
  public function testHashmapResolved(): void {
    $this->mockResolver('Query', 'map', new Hashmap([
      'a' => $this->builder->callback(fn () => 'foo'),
      'b' => $this->builder->callback(fn () => 'bar'),
    ])
    );
    $this->assertResults('{ map { a, b } }', [], [
      'map' => [
        'a' => 'foo',
        'b' => 'bar',
      ],
    ]);
  }

  /**
   * Hashmap with resolved values.
   */
  public function testHashmapDeferred(): void {
    $this->mockResolver('Query', 'map', new Hashmap([
      'a' => $this->builder->callback(fn () => new Deferred(fn () => 'foo')),
      'b' => $this->builder->callback(fn () => new Deferred(fn () => 'bar')),
    ])
    );
    $this->assertResults('{ map { a, b } }', [], [
      'map' => [
        'a' => 'foo',
        'b' => 'bar',
      ],
    ]);
  }

  /**
   * Hashmap with mixed values.
   */
  public function testHashmapMixed(): void {
    $this->mockResolver('Query', 'map', new Hashmap([
      'a' => 'foo',
      'b' => $this->builder->callback(fn () => 'bar'),
      'c' => $this->builder->callback(fn () => new Deferred(fn () => 'baz')),
    ])
    );
    $this->assertResults('{ map { a, b, c } }', [], [
      'map' => [
        'a' => 'foo',
        'b' => 'bar',
        'c' => 'baz',
      ],
    ]);
  }

}
