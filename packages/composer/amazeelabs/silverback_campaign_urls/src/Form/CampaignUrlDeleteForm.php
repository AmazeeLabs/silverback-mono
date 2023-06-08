<?php

namespace Drupal\silverback_campaign_urls\Form;

use Drupal\Core\Entity\ContentEntityConfirmFormBase;
use Drupal\Core\Url;
use Drupal\Core\Form\FormStateInterface;

class CampaignUrlDeleteForm extends ContentEntityConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to delete the campaign URL %source', array('%source' => $this->entity->getSource()));
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('campaign_url.list');
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
    $this->messenger()->addMessage(t('The campaign URL %source has been deleted.', array('%source' => $this->entity->getSource())));
    $form_state->setRedirect('campaign_url.list');
  }

}
