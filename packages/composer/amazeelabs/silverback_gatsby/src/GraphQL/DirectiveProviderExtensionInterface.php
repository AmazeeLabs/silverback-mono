<?php

namespace Drupal\silverback_gatsby\GraphQL;

/**
 * Interface for Schema extensions that provide new directives.
 *
 * TODO: Move this back into the upstream GraphQL module.
 *
 * @package Drupal\silverback_gatsby\GraphQL
 */
interface DirectiveProviderExtensionInterface {

  /**
   * Retrieve all directive definitions as a string.
   *
   * @return string
   */
  public function getDirectiveDefinitions() : string;
}
