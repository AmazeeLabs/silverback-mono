<?php

namespace Drupal\silverback_cloudinary\Form;

use Drupal\Core\Entity\EntityForm;
use Drupal\Core\Form\FormStateInterface;

class CloudinaryForm extends EntityForm {

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);

    /* @var \Drupal\silverback_cloudinary\CloudinaryInterface $cloudinary */
    $cloudinary = $this->entity;

    $form['label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Label'),
      '#maxlength' => 255,
      '#default_value' => $cloudinary->label(),
      '#description' => $this->t("Label for the Cloudinary instance."),
      '#required' => TRUE,
    ];
    $form['id'] = [
      '#type' => 'machine_name',
      '#default_value' => $cloudinary->id(),
      '#machine_name' => [
        'exists' => [$this, 'exist'],
      ],
      '#disabled' => !$cloudinary->isNew(),
    ];
    $form['is_default'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Default instance'),
      '#default_value' => $cloudinary->isDefault(),
    ];

    $form['cloud_name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Cloud name'),
      '#description' => $this->t('The cloud name you can find on your cloudinary dashboard.'),
      '#default_value' => $cloudinary->getCloudName(),
      '#required' => TRUE,
    ];

    $form['api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('API Key'),
      '#description' => $this->t('The API Key you can find on your cloudinary dashboard.'),
      '#default_value' => $cloudinary->getApiKey(),
      '#required' => TRUE,
    ];
    $form['api_secret'] = [
      '#type' => 'textfield',
      '#title' => $this->t('API Secret'),
      '#description' => $this->t('The API Secret you can find on your cloudinary dashboard.'),
      '#default_value' => $cloudinary->getApiSecret(),
      '#required' => TRUE,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    /* @var \Drupal\silverback_cloudinary\CloudinaryInterface $cloudinary */
    $cloudinary = $this->entity;
    $status = $cloudinary->save();

    if ($status === SAVED_NEW) {
      $this->messenger()->addMessage($this->t('The %label Cloudinary instance has been created.', [
        '%label' => $cloudinary->label(),
      ]));
    }
    else {
      $this->messenger()->addMessage($this->t('The %label Cloudinary instance has been updated.', [
        '%label' => $cloudinary->label(),
      ]));
    }

    // Update the default instance.
    if ($cloudinary->isDefault()) {
      $cloudinary->setDefault(FALSE);
    }
    if (!empty($form_state->getValue('is_default'))) {
      $cloudinary->setDefault();
    }

    $form_state->setRedirect('entity.cloudinary.collection');
  }

  /**
   * Helper function to check whether a Cloudinary configuration entity exists.
   */
  public function exist($id) {
    $entity = $this->entityTypeManager->getStorage('cloudinary')->getQuery()
      ->condition('id', $id)
      ->execute();
    return (bool) $entity;
  }

}
