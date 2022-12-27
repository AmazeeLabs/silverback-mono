<?php

namespace Drupal\silverback_cloudinary\Controller;

use Drupal\Core\Config\Entity\ConfigEntityListBuilder;
use Drupal\Core\Entity\EntityInterface;
use Drupal\silverback_cloudinary\Entity\Cloudinary;

class CloudinaryListBuilder extends ConfigEntityListBuilder {
  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['label'] = $this->t('Label');
    $header['id'] = $this->t('Machine name');
    $header['cloud_name'] = $this->t('Cloud name');
    $header['default'] = $this->t('Default');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    $defaultInstance = Cloudinary::getDefaultInstance();
    $row['label'] = $entity->label();
    $row['id'] = $entity->id();
    $row['cloud_name'] = $entity->getCloudName();
    $row['default'] = $defaultInstance === $entity->id() ? $this->t('Yes') : $this->t('No');

    return $row + parent::buildRow($entity);
  }
}
