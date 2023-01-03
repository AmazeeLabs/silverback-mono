<?php

namespace Drupal\graphql_directives;

class MapNestingException extends \Exception {
  protected string $type;

  public function __construct(string $type, string $field) {
    $this->type = $type;
    parent::__construct("Invalid nesting of @map directives in $type::$field. Maybe the return type has too many levels of []?");
  }
}