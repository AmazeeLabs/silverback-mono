<?php

namespace Drupal\graphql_directives;

use Drush\Commands\DrushCommands;

class Commands extends DrushCommands {

  protected DirectivePrinter $directivePrinter;

  public function __construct(DirectivePrinter $directivePrinter) {
    parent::__construct();
    $this->directivePrinter = $directivePrinter;
  }

  /**
   * Print graphql directives.
   *
   * @command graphql:directives
   * @aliases gd
   */
  public function schemaExport($folder = '../generated') {
    print $this->directivePrinter->printDirectives();
  }
}
