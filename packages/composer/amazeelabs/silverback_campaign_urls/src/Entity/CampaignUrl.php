<?php

namespace Drupal\silverback_campaign_urls\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * The campaign URL entity class.
 *
 * @ContentEntityType(
 *   id = "campaign_url",
 *   label = @Translation("Campaign URL"),
 *   handlers = {
 *     "list_builder" = "Drupal\silverback_campaign_urls\Entity\CampaignUrlListBuilder",
 *     "access" = "Drupal\silverback_campaign_urls\CampaignUrlAccessControlHandler",
 *     "form" = {
 *       "default" = "Drupal\silverback_campaign_urls\Form\CampaignUrlForm",
 *       "delete" = "Drupal\silverback_campaign_urls\Form\CampaignUrlDeleteForm",
 *       "edit" = "Drupal\silverback_campaign_urls\Form\CampaignUrlForm"
 *     },
 *     "views_data" = "Drupal\views\EntityViewsData"
 *   },
 *   base_table = "campaign_url",
 *   translatable = FALSE,
 *   admin_permission = "administer campaign urls",
 *   entity_keys = {
 *     "id" = "cid",
 *     "label" = "campaign_url_source",
 *     "uuid" = "uuid",
 *     "bundle" = "type",
 *   },
 *   links = {
 *     "canonical" = "/admin/config/search/campaign_url/edit/{campaign_url}",
 *     "delete-form" = "/admin/config/search/campaign_url/delete/{campaign_url}",
 *     "edit-form" = "/admin/config/search/campaign_url/edit/{campaign_url}",
 *   },
 *   constraints = {
 *     "UniqueCampaignUrlSource" = {}
 *   }
 * )
 */
class CampaignUrl extends ContentEntityBase implements CampaignUrlInterface {
  use EntityChangedTrait;

  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['campaign_url_source'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Source'))
      ->setDescription(t('Please provide the source path for this campaign URL. You can enter an internal path (starting with "/") or an external URL such as https://example.com. However, it can be any arbitrary source path that your hosting provider understands.'))
      ->setRequired(TRUE)
      ->setSetting('max_length', 1024)
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => -5,
      ])
      ->setDisplayConfigurable('form', TRUE);

    $fields['campaign_url_destination'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Destination'))
      ->setDescription(t('Same as <em>Source</em>, you can enter an internal path (starting with "/") or an external URL such as https://example.com. However, it can be any destination path that your hosting provider understands. If the site is multilingual, the language parameter has to be in the path (e.g.: <em>/en/test</em>)'))
      ->setRequired(TRUE)
      ->setSetting('max_length', 1024)
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => -3,
      ])
      ->setDisplayConfigurable('form', TRUE);

    $fields['status_code'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Status code'))
      ->setDescription(t('The campaign url redirect status code.'))
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
      ->setDescription(t('The user ID of the campaign URl author.'))
      ->setDefaultValueCallback('\Drupal\silverback_campaign_urls\Entity\CampaignUrl::getCurrentUserId')
      ->setSettings(array(
        'target_type' => 'user',
      ));
    $fields['edited_by'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Edited by'))
      ->setDescription(t('The user ID of the last person who edited the campaign URL.'))
      ->setDefaultValueCallback('\Drupal\silverback_campaign_urls\Entity\CampaignUrl::getCurrentUserId')
      ->setSettings(array(
        'target_type' => 'user',
      ));

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'))
      ->setDescription(t('The date when the campaign URL was created.'));
    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Updated'))
      ->setDescription(t('The date when the campaign URL was last updated.'));
    return $fields;
  }

  /**
   * {@inheritdoc}
   */
  public static function preCreate(EntityStorageInterface $storage, array &$values) {
    $values += [
      'type' => 'campaign_url',
    ];
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
  public function isCampaignRedirectForced() {
    if ($this->get('force')->isEmpty()) {
      return FALSE;
    }
    return (int) $this->get('force')->getValue()[0]['value'] > 0;
  }

  /**
   * {@inheritDoc}
   */
  public function getSource() {
    return $this->get('campaign_url_source')->getValue()[0]['value'];
  }

  /**
   * {@inheritDoc}
   */
  public function getDestination() {
    return $this->get('campaign_url_destination')->getValue()[0]['value'];
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
