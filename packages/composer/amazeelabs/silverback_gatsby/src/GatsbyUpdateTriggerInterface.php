<?php

namespace Drupal\silverback_gatsby;

interface GatsbyUpdateTriggerInterface {

  /**
   * Trigger a build for a given server with a build id.
   *
   * @param string $server
   *   The server id.
   * @param int $id
   *   The build id.
   */
  public function trigger(string $server, int $id) : void;

  /**
   * Send out notifications about potential updates to all Gatsby servers.
   */
  public function sendUpdates() : void;
}
