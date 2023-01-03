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
      implode("\n", [
        '"""',
        'Apply all directives on the right to output on the left.',
        '"""',
        'directive @map repeatable on FIELD_DEFINITION'
      ]),

      implode("\n", [
        '"""',
        'Mark a type as member of a generic.',
        'The id argument contains a string that has to match the generics resolution.',
        '"""',
        'directive @type(id: String!) repeatable on OBJECT'
      ]),
      implode("\n", [
        '"""',
        'Provide a default value for a given type.',
        '"""',
        'directive @default repeatable on UNION | SCALAR | OBJECT | INTERFACE'
      ]),
    ];
    $builtin[] = implode("\n", $lines);
    asort($builtin);
    $this->assertEquals(
      implode("\n", $builtin),
      $printer->printDirectives()
    );
  }

  public function testSingleDirective() {
    $this->assertDirectiveOutput([
      'todo' => [
        'id' => 'todo',
      ],
    ], [
      'directive @todo repeatable on FIELD_DEFINITION | SCALAR | UNION | INTERFACE | OBJECT',
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
      'directive @todo repeatable on FIELD_DEFINITION | SCALAR | UNION | INTERFACE | OBJECT',
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
      'directive @value(json: String!, function: String) repeatable on FIELD_DEFINITION | SCALAR | UNION | INTERFACE | OBJECT',
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
      'directive @todo repeatable on FIELD_DEFINITION | SCALAR | UNION | INTERFACE | OBJECT',
      'directive @value(json: String!, function: String) repeatable on FIELD_DEFINITION | SCALAR | UNION | INTERFACE | OBJECT',
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
      'directive @value(json: String!, function: String) repeatable on FIELD_DEFINITION | SCALAR | UNION | INTERFACE | OBJECT',
    ]);
  }
}
