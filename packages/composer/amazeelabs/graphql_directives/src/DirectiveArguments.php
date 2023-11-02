<?php

namespace Drupal\graphql_directives;

use Drupal\graphql\GraphQL\Execution\FieldContext;

/**
 * A structured object for passing arguments to directive resolvers.
 */
class DirectiveArguments {
  /**
   * The current incoming value.
   */
  public mixed $value;

  /**
   * Dicitionary of additional arguments.
   */
  public array $args;

  /**
   * The current field context.
   */
  public FieldContext $context;

  /**
   * Create a new arguments object.
   *
   * @param mixed $value
   *   The incoming value.
   * @param array<string,mixed> $args
   *   Dictionary of additional arguments.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $context
   *   The current field context.
   */
  public function __construct(mixed $value, array $args, FieldContext $context) {
    $this->value = $value;
    $this->args = $args;
    $this->context = $context;
  }

}
