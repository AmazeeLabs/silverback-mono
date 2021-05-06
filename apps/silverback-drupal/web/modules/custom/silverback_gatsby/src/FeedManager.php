<?php

namespace Drupal\silverback_gatsby;

/**
 * Simple service collector for Gatsby data feeds.
 *
 * @package Drupal\silverback_gatsby
 */
class FeedManager {

  /**
   * @var \Drupal\silverback_gatsby\FeedInterface[]
   */
  protected array $feeds = [];

  /**
   * Add a new feed.
   *
   * @param \Drupal\silverback_gatsby\FeedInterface $feed
   */
  public function addFeed(FeedInterface $feed) {
    $this->feeds[] = $feed;
  }

  /**
   * Retrieve the list of feeds.
   *
   * @return \Drupal\silverback_gatsby\FeedInterface[]
   */
  public function getFeeds() {
    return $this->feeds;
  }
}
