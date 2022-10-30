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

    $map = new DirectiveDefinitionNode([
      'name' => new NameNode(['value' => 'map']),
      'description' => new StringValueNode(['value' => implode("\n", [
          'Apply all directives on the right to output on the left.'
        ]), 'block' => TRUE]),
      'locations' => new NodeList([
        new NameNode(['value' => DirectiveLocation::FIELD_DEFINITION]),
      ]),
    ]);
    $directives = [Printer::doPrint($map)];
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
        'description' => count($description)
          ? new StringValueNode(['value' => implode("\n", $description), 'block' => TRUE])
          : NULL,
        'arguments' => new NodeList($arguments),
        'locations' => new NodeList([
          new NameNode(['value' => DirectiveLocation::FIELD_DEFINITION]),
        ]),
      ]);
      $directives[] = Printer::doPrint($dir);
    }
    return implode("\n", $directives);
  }
}
