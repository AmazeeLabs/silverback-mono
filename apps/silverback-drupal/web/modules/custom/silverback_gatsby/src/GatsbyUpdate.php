<?php

namespace Drupal\silverback_gatsby;

/**
 * Class GatsbyUpdate
 *
 * Simple struct to represent a Gatsby update event.
 *
 * @package Drupal\silverback_gatsby
 */
class GatsbyUpdate {

  /**
   * @var string $type
   *   The GraphQL type that was updated.
   */
  public string $type;

  /**
   * @var string $id
   *   The GraphQL object id that was updated.
   */
  public string $id;

  /**
   * GatsbyUpdate constructor.
   *
   * @param string $type
   *   The GraphQL type name.
   * @param string $id
   *   The GraphQL object id.
   */
  public function __construct(string $type, string $id) {
    $this->type = $type;
    $this->id = $id;
  }
}
