<?php

namespace Drupal\silverback_raw_redirect\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * The raw redirect entity class.
 *
 * @ContentEntityType(
 *   id = "raw_redirect",
 *   label = @Translation("Raw Redirect"),
 *   handlers = {
 *     "list_builder" = "Drupal\silverback_raw_redirect\Entity\RawRedirectListBuilder",
 *     "access" = "Drupal\silverback_raw_redirect\RawRdirectAccessControlHandler",
 *     "form" = {
 *       "default" = "Drupal\silverback_raw_redirect\Form\RawRedirectForm",
 *       "delete" = "Drupal\silverback_raw_redirect\Form\RawRedirectDeleteForm",
 *       "edit" = "Drupal\silverback_raw_redirect\Form\RawRedirectForm"
 *     },
 *     "views_data" = "Drupal\views\EntityViewsData"
 *   },
 *   base_table = "raw_redirect",
 *   translatable = FALSE,
 *   admin_permission = "administer raw redirects",
 *   entity_keys = {
 *     "id" = "rid",
 *     "label" = "redirect_source",
 *     "uuid" = "uuid"
 *   },
 *   links = {
 *     "canonical" = "/admin/config/search/raw_redirect/edit/{raw_redirect}",
 *     "delete-form" = "/admin/config/search/raw_redirect/delete/{raw_redirect}",
 *     "edit-form" = "/admin/config/search/raw_redirect/edit/{raw_redirect}",
 *   }
 * )
 */
class RawRedirect extends ContentEntityBase implements RawRedirectInterface {
  use EntityChangedTrait;

  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['redirect_source'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Source'))
      ->setDescription(t('Please provide the source path for this redirect. Usually, this is either a relative URL (starting with /) or an absolute path. But it can be basically any arbitrary source path that your specific hosting provider can understand.'))
      ->setRequired(TRUE)
      ->setSetting('max_length', 1024)
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => -5,
      ])
      ->setDisplayConfigurable('form', TRUE);

    $fields['redirect_destination'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Destination'))
      ->setDescription(t('Same as <em>Source</em>, this is usually a relative or absolute URL. But it can be any destination path that the hosting provider can understand.'))
      ->setRequired(TRUE)
      ->setSetting('max_length', 1024)
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => -3,
      ])
      ->setDisplayConfigurable('form', TRUE);

    $fields['status_code'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Status code'))
      ->setDescription(t('The redirect status code.'))
      ->setDefaultValue(301);

    $fields['force'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Force redirect'))
      ->setDescription(t('Force the redirect, even if there is already a static file matching the source URL.'))
      ->setDefaultValue(TRUE)
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'settings' => [
          'display_label' => TRUE,
        ],
      ])
      ->setDisplayConfigurable('form', TRUE);

    $fields['author'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Author'))
      ->setDescription(t('The user ID of the redirect author.'))
      ->setDefaultValueCallback('\Drupal\silverback_raw_redirect\Entity\RawRedirect::getCurrentUserId')
      ->setSettings(array(
        'target_type' => 'user',
      ));
    $fields['edited_by'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Edited by'))
      ->setDescription(t('The user ID of the last person who edited the redirect.'))
      ->setDefaultValueCallback('\Drupal\silverback_raw_redirect\Entity\RawRedirect::getCurrentUserId')
      ->setSettings(array(
        'target_type' => 'user',
      ));

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'))
      ->setDescription(t('The date when the redirect was created.'));
    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Updated'))
      ->setDescription(t('The date when the redirect was last updated.'));
    return $fields;
  }

  /**
   * {@inheritDoc}
   */
  public function preSave(EntityStorageInterface $storage) {
    parent::preSave($storage);
    // On every save, update the value of the editey_by field with the current
    // user's ID.
    $this->set('edited_by', static::getCurrentUserId());
  }

  /**
   * {@inheritDoc}
   */
  public function getStatusCode() {
    if ($this->get('status_code')->isEmpty()) {
      return NULL;
    }
    return $this->get('status_code')->getValue()[0]['value'];
  }

  /**
   * {@inheritDoc}
   */
  public function isForcedRedirect() {
    if ($this->get('force')->isEmpty()) {
      return FALSE;
    }
    return (int) $this->get('force')->getValue()[0]['value'] > 0;
  }

  /**
   * {@inheritDoc}
   */
  public function getSource() {
    return $this->get('redirect_source')->getValue()[0]['value'];
  }

  /**
   * Default value callback for the author and the edite_by fields.
   *
   * @see ::baseFieldDefinitions()
   *
   * @return array
   *   An array containing the current user id.
   */
  public static function getCurrentUserId() {
    return array(\Drupal::currentUser()->id());
  }
}
