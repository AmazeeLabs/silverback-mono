<?php

namespace Drupal\graphql_directives_test;

/**
 * Test resolvers.
 *
 * Service class for providing static and container injected resolvers.
 */
class TestResolvers {

  protected string $value;

  /**
   * @param string $value
   */
  public function __construct($value) {
    $this->value = $value;
  }

  /**
   * A static reslver.
   */
  public static function staticValue() : string {
    return 'static value';
  }

  /**
   * A resolver, acessing a container injected value.
   */
  public function containerValue() : string {
    return $this->value;
  }

}
