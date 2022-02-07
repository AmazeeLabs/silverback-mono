<?php

namespace Drupal\gatsby_build_monitor;

/**
 * Interface for the build monitor stats service.
 */
interface BuildMonitorStatsInterface {

  /**
   * Returns the average build duration of the last entries.
   *
   * @param int $itemsCount
   *   How many items to consider when building the average.
   * @return int
   */
  public function getAverageBuildDuration($itemsCount = 100);
}
