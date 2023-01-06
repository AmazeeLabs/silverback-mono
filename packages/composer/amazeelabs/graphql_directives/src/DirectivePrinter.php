<?php

namespace Drupal\graphql_directives;

use Drupal\Component\Plugin\PluginManagerInterface;
use GraphQL\Language\AST\DirectiveDefinitionNode;
use GraphQL\Language\AST\InputValueDefinitionNode;
use GraphQL\Language\AST\NameNode;
use GraphQL\Language\AST\NodeList;
use GraphQL\Language\AST\StringValueNode;
use GraphQL\Language\DirectiveLocation;
use GraphQL\Language\Printer;
use GraphQL\Language\Parser;

class DirectivePrinter {

  protected PluginManagerInterface $directiveManager;

  public function __construct(PluginManagerInterface $directiveManager) {
    $this->directiveManager = $directiveManager;
  }

  public function printDirectives() {
    $definitions = $this->directiveManager->getDefinitions();

    $default = new DirectiveDefinitionNode([
      'name' => new NameNode(['value' => 'default']),
      'repeatable' => TRUE,
      'description' => new StringValueNode(['value' => implode("\n", [
        'Provide a default value for a given type.'
      ]), 'block' => TRUE]),
      'arguments' => new NodeList([]),
      'locations' => new NodeList([
        new NameNode(['value' => DirectiveLocation::UNION]),
        new NameNode(['value' => DirectiveLocation::SCALAR]),
        new NameNode(['value' => DirectiveLocation::OBJECT]),
        new NameNode(['value' => DirectiveLocation::IFACE]),
      ]),
    ]);

    $map = new DirectiveDefinitionNode([
      'name' => new NameNode(['value' => 'map']),
      'repeatable' => TRUE,
      'description' => new StringValueNode(['value' => implode("\n", [
          'Apply all directives on the right to output on the left.'
        ]), 'block' => TRUE]),
      'arguments' => new NodeList([]),
      'locations' => new NodeList([
        new NameNode(['value' => DirectiveLocation::FIELD_DEFINITION]),
      ]),
    ]);

    $type = new DirectiveDefinitionNode([
      'name' => new NameNode(['value' => 'type']),
      'repeatable' => TRUE,
      'description' => new StringValueNode(['value' => implode("\n", [
        'Mark a type as member of a generic.',
        'The id argument contains a string that has to match the generics resolution.'
      ]), 'block' => TRUE]),
      'arguments' => new NodeList([
        new InputValueDefinitionNode([
            'name' => new NameNode(['value' => 'id']),
            'type' => Parser::parseType('String!'),
          ])
      ]),
      'locations' => new NodeList([
        new NameNode(['value' => DirectiveLocation::OBJECT]),
      ]),
    ]);

    $directives = [
      Printer::doPrint($default),
      Printer::doPrint($map),
      Printer::doPrint($type),
    ];
    foreach ($definitions as $definition) {

      $arguments = [];
      if (isset($definition['arguments'])) {
        foreach ($definition['arguments'] as $name => $type) {
          $arguments[] = new InputValueDefinitionNode([
            'name' => new NameNode(['value' => $name]),
            'type' => Parser::parseType($type),
          ]);
        }
      }

      $description = isset($definition['description'])
        ? [$definition['description']]
        : [];

      if (isset($definition['provider']) || isset($definition['class'])) {
        $description[] = '';
      }

      if (isset($definition['provider'])) {
        $description[] = sprintf('Provided by the "%s" module.', $definition['provider']);
      }

      if (isset($definition['class'])) {
        $description[] = sprintf('Implemented in "%s".', $definition['class']);
      }

      $dir = new DirectiveDefinitionNode([
        'name' => new NameNode(['value' => $definition['id']]),
        'repeatable' => TRUE,
        'description' => count($description)
          ? new StringValueNode(['value' => implode("\n", $description), 'block' => TRUE])
          : NULL,
        'arguments' => new NodeList($arguments),
        'locations' => new NodeList([
          new NameNode(['value' => DirectiveLocation::FIELD_DEFINITION]),
          new NameNode(['value' => DirectiveLocation::SCALAR]),
          new NameNode(['value' => DirectiveLocation::UNION]),
          new NameNode(['value' => DirectiveLocation::IFACE]),
          new NameNode(['value' => DirectiveLocation::OBJECT]),
        ]),
      ]);
      $directives[] = Printer::doPrint($dir);
    }
    asort($directives);
    return implode("\n", $directives);
  }
}
