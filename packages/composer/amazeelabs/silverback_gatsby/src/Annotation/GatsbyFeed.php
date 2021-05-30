<?php

namespace Drupal\silverback_gatsby\Annotation;

use Doctrine\Common\Annotations\AnnotationException;
use Drupal\Component\Annotation\Plugin;

/**
 * Annotation for Gatsby GraphQL data feeds.
 *
 * @Annotation
 * @codeCoverageIgnore
 */
class GatsbyFeed extends Plugin {

  /**
   * The plugin ID.
   *
   * It also serves as the handle for the GraphQL directive.
   *
   * @var string
   */
  public $id;

  /**
   * Feed constructor.
   *
   * @param mixed $values
   *   The plugin annotation values.
   *
   * @throws \Doctrine\Common\Annotations\AnnotationException
   *   In case of missing required values.
   */
  public function __construct($values) {
    if (!array_key_exists('id', $values) || !$values['id']) {
      throw new AnnotationException('The plugin is missing an "id" property.');
    }
    parent::__construct($values);
  }

}
