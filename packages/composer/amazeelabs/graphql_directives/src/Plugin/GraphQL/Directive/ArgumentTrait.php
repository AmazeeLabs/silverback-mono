<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\graphql\GraphQL\ResolverBuilder;

trait ArgumentTrait {
  protected function argumentResolver($arg, ResolverBuilder $builder) {
    if ($arg === '$') {
      return $builder->fromParent();
    }
    else if (preg_match('/^\\$.+/', $arg)) {
      return $builder->fromArgument(substr($arg, 1));
    }
    else {
      return $builder->fromValue($arg);
    }
  }
}
