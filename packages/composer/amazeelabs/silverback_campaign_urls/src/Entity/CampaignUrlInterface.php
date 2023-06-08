<?php

namespace Drupal\silverback_campaign_urls\Entity;

use Drupal\Core\Entity\EntityChangedInterface;

interface CampaignUrlInterface extends EntityChangedInterface {

  /**
   * Returns the status code of the campaign URL.
   *
   * @return int
   */
  public function getStatusCode();

  /**
   * Returns true of the campaign URL redirect is forced, false otherwise.
   *
   * @return boolean
   */
  public function isCampaignRedirectForced();

  /**
   * Returns the source of the campaign URL.
   * @return string
   */
  public function getSource();

  /**
   * Returns the destination of the campaign URL.
   * @return string
   */
  public function getDestination();
}
