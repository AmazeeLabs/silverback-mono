<?php

namespace Drupal\silverback_raw_redirect\Entity;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;

class RawRedirectListBuilder extends EntityListBuilder {

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
    if (!$entity instanceof RawRedirect) {
      return parent::buildRow($entity);
    }
    $row['source'] = $entity->get('redirect_source')->getValue()[0]['value'];
    $row['destination'] = $entity->get('redirect_destination')->getValue()[0]['value'];
    $row['status_code'] = $entity->get('status_code')->getValue()[0]['value'];
    $row['force'] = $entity->isForcedRedirect() ? $this->t('Yes') : $this->t('No');

    return $row + parent::buildRow($entity);
  }

}
