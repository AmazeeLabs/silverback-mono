<?php

namespace Drupal\gatsby_build_monitor;

use Drupal\Core\Database\Connection;

/**
 * Build monitor stats service.
 */
class BuildMonitorStats implements BuildMonitorStatsInterface {

  /**
   * The database service.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * Constructs a BuildMonitorStats object.
   *
   * @param Connection $database
   */
  public function __construct(Connection $database) {
    $this->database = $database;
  }

  /**
   * {@inheritDoc}
   */
  public function getAverageBuildDuration($itemsCount = 100) {
    $stats = $this->database->select('gatsby_build_monitor_stats', 's')
      ->fields('s', ['spent', 'id'])
      ->condition('s.has_errors', 0)
      ->orderBy('s.id', 'DESC')
      ->range(0, $itemsCount)
      ->execute()->fetchAll();
    $duration = [];
    foreach ($stats as $stat) {
      if (empty($duration[$stat->spent])) {
        $duration[$stat->spent] = 0;
      }
      $duration[$stat->spent]++;
    }
    arsort($duration, SORT_NUMERIC);
    // Only consider the first half of the duration array, because they contain
    // the values which appear more often for the build time.
    $duration = array_slice($duration, 0, count($duration) / 2, TRUE);

    // From the remaining results, we now compute the weighted average. In the
    // $duration array we have the keys corresponding to the number of seconds
    // and the values the number of times a build took that number of seconds to
    // run.
    $weightedSum = array_sum($duration);
    // If, for any reason, we got an empty weightedSum, just return 0 to avoid
    // a division by 0 warning.
    if ($weightedSum <= 0) {
      return 0;
    }
    $product = 0;
    foreach ($duration as $seconds => $weight) {
      $product += $seconds * $weight;
    }
    return (int) ($product / $weightedSum);
  }
}
