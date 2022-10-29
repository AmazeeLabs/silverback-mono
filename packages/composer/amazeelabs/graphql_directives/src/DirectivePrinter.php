<?php

namespace Drupal\graphql_directives;

use Drupal\Component\Plugin\PluginManagerInterface;
use GraphQL\Language\AST\DirectiveDefinitionNode;
use GraphQL\Language\AST\InputValueDefinitionNode;
use GraphQL\Language\AST\NameNode;
use GraphQL\Language\AST\NodeList;
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
    $directives = [];
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

      $dir = new DirectiveDefinitionNode([
        'name' => new NameNode(['value' => $definition['id']]),
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
