<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use Drupal\Tests\graphql_directives\Traits\GraphQLDirectivesTestTrait;

class DefaultValueTest extends GraphQLTestBase {
  use GraphQLDirectivesTestTrait;

  public static $modules = [
    'graphql_directives',
  ];

  protected function setUp() : void {
    parent::setUp();
    $this->setupDirectableSchema(__DIR__ . '/../../assets/default');
  }

  public function testOptionalValue() {
    $this->assertResults('{ optional }', [], ['optional' => NULL]);
  }

  public function testDefaultString() {
    $this->assertResults('{ string }', [], ['string' => '']);
  }

  public function testDefaultInt() {
    $this->assertResults('{ int }', [], ['int' => 0]);
  }

  public function testDefaultFloat() {
    $this->assertResults('{ float }', [], ['float' => 0.0]);
  }

  public function testDefaultBoolean() {
    $this->assertResults('{ boolean }', [], ['boolean' => FALSE]);
  }

  public function testDefaultList() {
    $this->assertResults('{ list }', [], ['list' => []]);
  }

  public function testDefaultObject() {
    $this->assertResults('{ object { prop, optional, mandatory }', [], ['object' => [
      'prop' => '',
      'optional' => NULL,
      'mandatory' => '',
    ]]);
  }

  public function testManualDefault() {
    $this->assertResults('{ manual }', [], ['manual' => 'foo']);
  }

  public function testChainedDefaults() {
    $this->assertResults('{ object { chained } }', [], [
      'object' => [
        'chain' => 'bar'
      ]
    ]);
  }
}