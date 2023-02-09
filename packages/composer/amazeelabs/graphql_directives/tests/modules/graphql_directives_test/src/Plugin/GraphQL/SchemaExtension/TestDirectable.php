<?php

namespace Drupal\graphql_directives_test\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql_directives\DirectableSchemaExtensionPluginBase;
use GraphQL\Language\AST\DocumentNode;
use GraphQL\Language\AST\ObjectTypeDefinitionNode;

/**
 * @SchemaExtension(
 *   id = "test_directable",
 *   name = "Test directable",
 * )
 */
class TestDirectable extends DirectableSchemaExtensionPluginBase {

  protected function getDirectableExtensionDefinition(DocumentNode $ast): string {
    $doc = [];
    foreach ($ast->definitions as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        foreach ($definition->directives as $directive) {
          if ($directive->name->value === 'test_directable') {
            $type = $definition->name->value;
            $doc[] = "extend type Query { list$type :[$type!]! }";
          }
        }
      }
    }
    return implode("\n", $doc);
  }

  protected function registerDirectableResolvers(DocumentNode $ast, ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();
    foreach ($ast->definitions as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        foreach ($definition->directives as $directive) {
          if ($directive->name->value === 'test_directable') {
            $registry->addFieldResolver('Query', 'list' . $definition->name->value, $builder->fromValue([
              [ 'title' => 'One'],
              [ 'title' => 'Two'],
            ]));
          }
        }
      }
    }
  }

}
