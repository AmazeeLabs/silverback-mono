<?php

namespace Drupal\silverback_gatsby;

interface GatsbyUpdateTrackerInterface {

  /**
   * Clear the in-memory de-duplication cache.
   *
   * Mainly used for unit testing.
   */
  public function clear() : void;

  /**
   * Track an update for a given GraphQL object.
   *
   * @param string $server
   *   The GraphQL server ID this log is related to.
   * @param string $type
   *   The GraphQL type that has changed.
   * @param string $id
   *   The id of the changed stream entry.
   *
   * @return int
   *   The unique build id for this entry.
   *
   * @throws \Exception
   */
  public function track(string $server, string $type, string $id) : int;

  /**
   * Retrieve the changes that happened between the last and the current build.
   *
   * @param int $lastBuild
   *   The last successful build id as returned by `log`.
   * @param int $currentBuild
   *   The current build id as returned by `log`.
   * @param string $server
   *   The GraphQL server id.
   *
   * @return \Drupal\silverback_gatsby\GatsbyUpdate[]
   *   A list of [GraphQLType, ID] tuples that can be used by the source plugin
   *   to fetch changes
   */
  public function diff(int $lastBuild, int $currentBuild, string $server) : array;

  /**
   * Retrieve the id of the latest build for a given server..
   *
   * Used for comparing states between systems.
   *
   * @param string $server
   *   The server id to retrieve the latest build for.
   *
   * @return int
   */
  public function latestBuild(string $server) : int;
}

