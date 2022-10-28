<?php

namespace Drupal\graphql_directives\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * @Annotation
 * Annotation for GraphQL directives.
 */
class Directive extends Plugin {
  /**
   * The directive name without the `@`.
   *
   * @var string
   */
  public string $id;

  /**
   * The directives argument definitions.
   *
   * @var array
   */
  public array $arguments;
}
