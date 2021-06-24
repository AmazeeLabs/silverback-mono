<?php

namespace Drupal\silverback_gatsby\GraphQL;

use Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema as OriginalComposableSchema;

/**
 * Base class for composable/extensible schemas.
 *
 * TODO: Move this back into the upstream GraphQL module.
 *
 * Allows extensions to access the host schema AST and define directives
 * that can be used by the host schema.
 *
 * Grants public access to extensions so other services can interact with them.
 *
 * @package Drupal\silverback_gatsby\GraphQL
 */
class ComposableSchema extends OriginalComposableSchema {

  /**
   * {@inheritDoc}
   */
  public function getExtensions() {
    $extensions = parent::getExtensions();

    $schema = $this->getSchemaDefinition();
    // Iterate through all extensions and pass them the current schema, so they
    // can act on it.
    foreach($extensions as $extension) {
      if ($extension instanceof ParentAwareSchemaExtensionInterface) {
        $extension->setParentSchemaDefinition($schema);
      }
    }

    return $extensions;
  }

  /**
   * {@inheritDoc}
   */
  public function getSchemaDefinition() {
    $extensions = parent::getExtensions();

    // Get all extensions and prepend any defined directives to the schema.
    $schema = [];
    foreach ($extensions as $extension) {
      if ($extension instanceof DirectiveProviderExtensionInterface) {
        $schema[] = $extension->getDirectiveDefinitions();
      }
    }

    // Attempt to load a schema file and return it instead of the hardcoded
    // empty schema in \Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema.
    $id = $this->getPluginId();
    $definition = $this->getPluginDefinition();
    $module = $this->moduleHandler->getModule($definition['provider']);
    $path = 'graphql/' . $id . '.graphqls';
    $file = $module->getPath() . '/' . $path;

    if (!file_exists($file)) {
      return parent::getSchemaDefinition();
    }

    $schema[] = file_get_contents($file);

    return implode("\n", $schema);
  }
}
