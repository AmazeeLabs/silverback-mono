<?php

namespace Drupal\silverback_campaign_urls\Entity;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;

class CampaignUrlListBuilder extends EntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['source'] = $this->t('Source');
    $header['destination'] = $this->t('Destination');
    $header['status_code'] = $this->t('Status code');
    $header['force'] = $this->t('Force redirect');

    return $header + parent::buildHeader();
  }


  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    if (!$entity instanceof CampaignUrl) {
      return parent::buildRow($entity);
    }
    $row['source'] = $entity->getSource();
    $row['destination'] = $entity->getDestination();
    $row['status_code'] = $entity->getStatusCode();
    $row['force'] = $entity->isCampaignRedirectForced() ? $this->t('Yes') : $this->t('No');

    return $row + parent::buildRow($entity);
  }

}
