<?php

namespace Drupal\silverback_cloudinary;

use Drupal\Core\Config\Entity\ConfigEntityInterface;

interface CloudinaryInterface extends ConfigEntityInterface {

  /**
   * Returns the cloud name of the cloudinary instance.
   *
   * @return string
   */
  public function getCloudName();

  /**
   * Returns the API key of the cloudinary service.
   *
   * @return string
   */
  public function getApiKey();

  /**
   * Returns the API secret of the cloudinary service.
   *
   * @return string
   */
  public function getApiSecret();

  /**
   * Checks if the cloudinary instance entity is the default one.
   * @return bool
   */
  public function isDefault();

  /**
   * Sets or removes the default flag for the cloudinary instance entity.
   *
   * @param boolean $default
   *  If set to FALSE, the default flag will be removed.
   * @return void
   */
  public function setDefault($default = TRUE);
}
