<?php

namespace Drupal\silverback_cloudinary\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\silverback_cloudinary\CloudinaryInterface;

/**
 * Defines the Cloudinary entity.
 *
 * @ConfigEntityType(
 *   id = "cloudinary",
 *   label = @Translation("Cloudinary instance"),
 *   handlers = {
 *     "list_builder" = "Drupal\silverback_cloudinary\Controller\CloudinaryListBuilder",
 *     "form" = {
 *       "add" = "Drupal\silverback_cloudinary\Form\CloudinaryForm",
 *       "edit" = "Drupal\silverback_cloudinary\Form\CloudinaryForm",
 *       "delete" = "Drupal\silverback_cloudinary\Form\CloudinaryDeleteForm",
 *     }
 *   },
 *   config_prefix = "cloudinary",
 *   admin_permission = "administer cloudinary",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "label",
 *   },
 *   config_export = {
 *     "id",
 *     "label",
 *     "cloud_name",
 *   },
 *   links = {
 *     "edit-form" = "/admin/config/services/cloudinary/{cloudinary}",
 *     "delete-form" = "/admin/config/services/cloudinary/{cloudinary}/delete",
 *   }
 * )
 */

class Cloudinary extends ConfigEntityBase implements CloudinaryInterface {
  /**
   * The Cloudinary instance ID.
   *
   * @var string
   */
  protected $id;

  /**
   * The Cloudinary instance label.
   *
   * @var string
   */
  protected $label;

  /**
   * The Cloudinary instance cloud name
   * @var string
   */
  protected $cloud_name;

  /**
   * The Cloudinary instance API key.
   * @var string
   */
  protected $api_key;

  /**
   * The Cloudinary instance API secret.
   * @var string
   */
  protected $api_secret;

  public function __construct(array $values, $entity_type) {
    parent::__construct($values, $entity_type);
    $this->api_key = $this->loadApiKey();
    $this->api_secret = $this->loadApiSecret();
  }

  /**
   * {@inheritDoc}
   */
  public function getCloudName() {
    return $this->cloud_name;
  }

  /**
   * {@inheritDoc}
   */
  public function getApiKey(){
    return $this->api_key;
  }

  /**
   * {@inheritDoc}
   */
  public function getApiSecret() {
    return $this->api_secret;
  }

  /**
   * {@inheritDoc}
   */
  public function isDefault() {
    $default = $this->state()->get('cloudinary.default_instance', NULL);
    return $default !== NULL && $default === $this->id();
  }

  /**
   * {@inheritDoc}
   */
  public function setDefault($default = TRUE) {
    // We only remove the default flag if the current cloudinary entity is
    // actually the default one.
    if (!$default && $this->isDefault()) {
      $this->state()->delete('cloudinary.default_instance');
    } elseif ($default) {
      $this->state()->set('cloudinary.default_instance', $this->id());
    }
  }

  public function save() {
    try {
      $return = parent::save();
      // We need to update these keys separately, since they will not be
      // exported into configuration, as they contain sensitive information.
      $this->updateApiKey($this->api_key);
      $this->updateApiSecret($this->api_secret);
    } catch ( EntityStorageException $e) {
      // In case of failure, just do nothing. We need this try/catch block just
      // to not update the api key and secret in the state in case the save
      // operation fails for any reason.
    }
    return $return;
  }

  public function delete() {
    try {
      parent::delete();
      $this->deleteApiKey();
      $this->deleteApiSecret();
    } catch (EntityStorageException $e) {
      // Similar like in the save() operation, we just need this to prevent the
      // deletion of the api key and secret from the state in case the deletion
      // operation fails for any reason.
    }
  }

  /**
   * Loads the api key for the cloudinary instance from the state.
   * @return mixed|string
   */
  protected function loadApiKey() {
    return !empty($this->id()) ? $this->state()->get('cloudinary.api_key.' . $this->id(), NULL) : '';
  }

  /**
   * Loads the api secret for the cloudinary instance from the state.
   * @return mixed|string
   */
  protected function loadApiSecret() {
    return !empty($this->id()) ? $this->state()->get('cloudinary.api_secret.' . $this->id(), NULL) : '';
  }

  /**
   * Updates the api key for the cloudinary instance entity, in the state.
   *
   * @param string $apiKey
   *  The new API key.
   * @return void
   */
  protected function updateApiKey($apiKey) {
    $this->state()->set('cloudinary.api_key.' . $this->id(), $apiKey);
  }

  /**
   * Updates the api secret for the cloudinary instance entity, in the state.
   *
   * @param string $apiSecret
   *  The new API secret.
   * @return void
   */
  protected function updateApiSecret($apiSecret) {
    $this->state()->set('cloudinary.api_secret.' . $this->id(), $apiSecret);
  }

  /**
   * Deletes the API key for the cloudinary instance entity, from the state.
   * @return void
   */
  protected function deleteApiKey() {
    $this->state()->delete('cloudinary.api_key.' . $this->id());
  }

  /**
   * Deletes the API secret for the cloudinary instance entity, from the state.
   * @return void
   */
  protected function deleteApiSecret() {
    $this->state()->delete('cloudinary.api_secret.' . $this->id());
  }

  protected function state() {
    return \Drupal::state();
  }

  /**
   * Returns the id of the default cloudinary instance.
   *
   * @return string|NULL
   */
  public static function getDefaultInstance() {
    return \Drupal::state()->get('cloudinary.default_instance', NULL);
  }

}
