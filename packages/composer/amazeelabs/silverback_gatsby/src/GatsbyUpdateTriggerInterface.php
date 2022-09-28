<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\StringTranslation\TranslatableMarkup;

interface GatsbyUpdateTriggerInterface {

  /**
   * Trigger an update for a given server with a type name and entity id.
   *
   * @param string $server
   *   The server id.
   * @param \Drupal\silverback_gatsby\GatsbyUpdate $update
   */
  public function trigger(string $server, GatsbyUpdate $update) : void;

  /**
   * Send out notifications about potential updates to all Gatsby servers.
   */
  public function sendUpdates() : void;
}
