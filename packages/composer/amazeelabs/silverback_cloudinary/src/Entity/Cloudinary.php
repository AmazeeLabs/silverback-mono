<?php

namespace Drupal\silverback_cloudinary\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBase;
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
 *     "label"
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

}
