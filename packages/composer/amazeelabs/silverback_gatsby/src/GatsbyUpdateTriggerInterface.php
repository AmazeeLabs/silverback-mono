<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\StringTranslation\TranslatableMarkup;

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
   * Trigger a build for a given server based on latest build id.
   *
   * Compares the latest build id with the one on the frontend to not
   * trigger unnecessary builds.
   *
   * @param string $server
   *   The server id.
   *
   * @return TranslatableMarkup
   *   The resut message.
   */
  public function triggerLatestBuild(string $server) : TranslatableMarkup;

  /**
   * Send out notifications about potential updates to all Gatsby servers.
   */
  public function sendUpdates() : void;
}
