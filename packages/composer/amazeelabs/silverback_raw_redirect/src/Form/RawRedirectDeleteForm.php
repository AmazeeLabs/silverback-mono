<?php

namespace Drupal\silverback_raw_redirect\Form;

use Drupal\Core\Entity\ContentEntityConfirmFormBase;
use Drupal\Core\Url;
use Drupal\Core\Form\FormStateInterface;

class RawRedirectDeleteForm extends ContentEntityConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to delete the redirect %source', array('%source' => $this->entity->getSource()));
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('raw_redirect.list');
  }

  /**
   * {@inheritdoc}
   */
  public function getConfirmText() {
    return $this->t('Delete');
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->entity->delete();
    $this->messenger()->addMessage(t('The redirect %source has been deleted.', array('%source' => $this->entity->getSource())));
    $form_state->setRedirect('raw_redirect.list');
  }

}
