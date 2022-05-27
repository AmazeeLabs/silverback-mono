<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Database\Connection;
use Drupal\Core\Session\AccountInterface;

/**
 * Class GatsbyUpdateTracker
 *
 * Track, store and retrieve updates that happened concerning
 *
 * @package Drupal\silverback_gatsby
 */
class GatsbyUpdateTracker implements GatsbyUpdateTrackerInterface {
  protected Connection $database;
  protected AccountInterface $currentUser;
  protected GatsbyUpdateTriggerInterface $trigger;
  protected array $tracked;

  public function __construct(
    Connection $database,
    AccountInterface $currentUser,
    GatsbyUpdateTriggerInterface $trigger
  ) {
    $this->tracked = [];
    $this->database = $database;
    $this->currentUser = $currentUser;
    $this->trigger = $trigger;
  }

  /**
   * {@inheritDoc}
   */
  public function clear() : void {
    $this->tracked = [];
  }

  /**
   * {@inheritDoc}
   */
  public function track(string $server, string $type, string $id, bool $trigger = TRUE) : int {
    if (isset($this->tracked[$server]) && isset($this->tracked[$server][$type]) && in_array($id,$this->tracked[$server][$type])) {
      return $this->latestBuild($server);
    }
    $this->tracked[$server][$type][] = $id;
    $buildId = $this->database->insert('gatsby_update_log')->fields([
      'server' => $server,
      'type' => $type,
      'object_id' => $id,
      'uid' => $this->currentUser->id(),
      'timestamp' => time(),
    ])->execute();
    if ($trigger) {
      $this->trigger->trigger($server, $buildId);
    }
    return $buildId;
  }

  /**
   * {@inheritDoc}
   */
  public function diff(int $lastBuild, int $currentBuild, string $server) : array {
    $count = intval($this->database->select('gatsby_update_log', 'gul')
      ->condition('server', $server)
      ->condition('id', [$lastBuild, $currentBuild], 'IN')
      ->countQuery()
      ->execute()
      ->fetchField());

    // If either of the two builds does not exist, we can't be sure about
    // history consistency and return an empty list which will trigger a full
    // rebuild.
    if ($count < 2) {
      return [];
    }

    return array_map(fn ($row) => new GatsbyUpdate($row->type, $row->object_id), $this->database
      ->select('gatsby_update_log', 'gul')
      ->fields('gul', ['type', 'object_id'])
      ->condition('id', $lastBuild, '>')
      ->condition('id', $currentBuild, '<=')
      ->condition('server', $server)
      ->execute()
      ->fetchAll());
  }

  /**
   * {@inheritDoc}}
   */
  public function latestBuild(string $server) : int {
    $query = $this->database->select('gatsby_update_log');
    $query->condition('server', $server);
    $query->addExpression('max(id)');
    return $query->execute()->fetchField() ?: -1;
  }
}
