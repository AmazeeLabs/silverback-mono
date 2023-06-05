<?php

namespace Drupal\silverback_raw_redirect\Entity;

use Drupal\Core\Entity\EntityChangedInterface;

interface RawRedirectInterface extends EntityChangedInterface {

  /**
   * Returns the status code of the redirect.
   *
   * @return int
   */
  public function getStatusCode();

  /**
   * Returns true of the redirect is forced, false otherwise.
   *
   * @return boolean
   */
  public function isForcedRedirect();

  /**
   * Returns the source of the redirect.
   * @return string
   */
  public function getSource();
}
