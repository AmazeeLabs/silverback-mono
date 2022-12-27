<?php

namespace Drupal\silverback_cloudinary\Form;

use Drupal\Core\Entity\EntityForm;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class CloudinaryForm extends EntityForm {

  /**
   * Constructs an CloudinaryForm object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entityTypeManager.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager) {
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);

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

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
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
