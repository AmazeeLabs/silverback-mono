<?php

namespace Drupal\graphql_directives;

use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use GraphQL\Language\AST\DocumentNode;

/**
 * Base class for directable schema extension plugins.
 *
 * Directable schema extension plugins get access to the parent schema AST and
 * are allowed to adjust the extension definition and resolvers accordingly.
 */
abstract class DirectableSchemaExtensionPluginBase extends SdlSchemaExtensionPluginBase {

  private DocumentNode $parentAst;

  public function setParentAst(DocumentNode $ast) {
    $this->parentAst = $ast;
  }

  abstract protected function getDirectableExtensionDefinition(DocumentNode $ast): string;
  abstract protected function registerDirectableResolvers(DocumentNode $ast, ResolverRegistryInterface $registry): void;

  /**
   * {@inheritDoc}
   */
  final public function getExtensionDefinition() {
    return implode("\n", array_filter([
      parent::getExtensionDefinition(),
      $this->getDirectableExtensionDefinition($this->parentAst),
    ]));
  }

  /**
   * {@inheritDoc}
   */
  final public function registerResolvers(ResolverRegistryInterface $registry) {
    $this->registerDirectableResolvers($this->parentAst, $registry);
  }

}
