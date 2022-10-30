<?php

namespace Drupal\Tests\graphql_directives\Unit;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\graphql_directives\DirectivePrinter;
use Drupal\Tests\UnitTestCase;

class DirectivePrinterTest extends UnitTestCase {
  protected function assertDirectiveOutput($plugins, $lines) {
    $directiveManager = $this->prophesize(PluginManagerInterface::class);
    $directiveManager->getDefinitions()->willReturn($plugins);
    $printer = new DirectivePrinter($directiveManager->reveal());
    $builtin = [
      '"""',
      'Apply all directives on the right to output on the left.',
      '"""',
      'directive @map on FIELD_DEFINITION',
    ];
    $this->assertEquals(
      implode("\n", array_merge($builtin, $lines)),
      $printer->printDirectives()
    );
  }

  public function testSingleDirective() {
    $this->assertDirectiveOutput([
      'todo' => [
        'id' => 'todo',
      ],
    ], [
      'directive @todo on FIELD_DEFINITION',
    ]);
  }

  public function testCommentedDirective() {
    $this->assertDirectiveOutput([
      'todo' => [
        'id' => 'todo',
        'description' => 'Mark a field as not implemented.',
      ],
    ], [
      '"""',
      'Mark a field as not implemented.',
      '"""',
      'directive @todo on FIELD_DEFINITION',
    ]);
  }


  public function testDirectiveArguments() {
    $this->assertDirectiveOutput([
      'value' => [
        'id' => 'value',
        'arguments' => [
          'json' => 'String!',
          'function' => 'String',
        ],
      ],
    ], [
      'directive @value(json: String!, function: String) on FIELD_DEFINITION',
    ]);
  }

  public function testMultipleDirectives() {
    $this->assertDirectiveOutput([
      'value' => [
        'id' => 'value',
        'arguments' => [
          'json' => 'String!',
          'function' => 'String',
        ],
      ],
      'todo' => [
        'id' => 'todo',
      ],
    ], [
      'directive @value(json: String!, function: String) on FIELD_DEFINITION',
      'directive @todo on FIELD_DEFINITION',
    ]);
  }

  public function testProviderInfo() {
    $this->assertDirectiveOutput([
      'value' => [
        'id' => 'value',
        'description' => 'Provide a static json value.',
        'arguments' => [
          'json' => 'String!',
          'function' => 'String',
        ],
        'class' => 'Drupal\graphql_directives\Plugin\GraphQL\Directive\Value',
        'provider' => 'graphql_directives',
      ],
    ], [
      '"""',
      'Provide a static json value.',
      '',
      'Provided by the "graphql_directives" module.',
      'Implemented in "Drupal\graphql_directives\Plugin\GraphQL\Directive\Value".',
      '"""',
      'directive @value(json: String!, function: String) on FIELD_DEFINITION',
    ]);
  }
}
