<?php

namespace Drupal\graphql_directives;

class MissingDefaultException extends \Exception {
  protected string $type;

  public function __construct(string $type) {
    $this->type = $type;
    parent::__construct("Missing @default directive for type $type. Either add a @default directive to $type or turn all occasions of '$type!' into '$type'.");
  }
}