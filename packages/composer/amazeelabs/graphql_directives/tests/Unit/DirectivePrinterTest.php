<?php

namespace Drupal\Tests\graphql_directives\Unit;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\graphql_directives\DirectivePrinter;
use Drupal\Tests\UnitTestCase;

class DirectivePrinterTest extends UnitTestCase {
  public function testSingleDirective() {
    $directiveManager = $this->prophesize(PluginManagerInterface::class);
    $directiveManager->getDefinitions()->willReturn([
      'todo' => [
        'id' => 'todo',
      ],
    ]);
    $printer = new DirectivePrinter($directiveManager->reveal());

    $this->assertEquals(
      'directive @todo on FIELD_DEFINITION',
      $printer->printDirectives()
    );
  }
  public function testDirectiveArguments() {
    $directiveManager = $this->prophesize(PluginManagerInterface::class);
    $directiveManager->getDefinitions()->willReturn([
      'value' => [
        'id' => 'value',
        'arguments' => [
          'json' => 'String!',
          'function' => 'String',
        ],
      ],
    ]);
    $printer = new DirectivePrinter($directiveManager->reveal());

    $this->assertEquals(
      'directive @value(json: String!, function: String) on FIELD_DEFINITION',
      $printer->printDirectives()
    );
  }

  public function testMultipleDirectives() {
    $directiveManager = $this->prophesize(PluginManagerInterface::class);
    $directiveManager->getDefinitions()->willReturn([
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
    ]);
    $printer = new DirectivePrinter($directiveManager->reveal());

    $this->assertEquals(
      implode("\n", [
        'directive @value(json: String!, function: String) on FIELD_DEFINITION',
        'directive @todo on FIELD_DEFINITION',
      ]),
      $printer->printDirectives()
    );
  }

}
