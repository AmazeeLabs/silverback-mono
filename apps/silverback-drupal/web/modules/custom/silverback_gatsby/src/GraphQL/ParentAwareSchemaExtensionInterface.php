<?php

namespace Drupal\silverback_gatsby\GraphQL;

/**
 * Interface for schema extensions that need to inspect the host schema.
 *
 * TODO: Move this back into the upstream GraphQL module.
 *
 * @package Drupal\silverback_gatsby\GraphQL
 */
interface ParentAwareSchemaExtensionInterface {

  /**
   * Pass the parent schema definition string to the extension.
   *
   * @param string $definition
   *
   * @return void
   */
  public function setParentSchemaDefinition(string $definition);
}
