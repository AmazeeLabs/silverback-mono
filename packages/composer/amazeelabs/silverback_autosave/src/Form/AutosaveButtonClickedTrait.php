<?php

namespace Drupal\silverback_autosave\Form;

use Drupal\Core\Form\FormStateInterface;

/**
 *
 */
trait AutosaveButtonClickedTrait {

  /**
   * Checks if the submission is triggered by autosave save.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   *
   * @return bool
   *   TRUE if the form submission is triggered by autosave, FALSE otherwise.
   */
  protected function isAutosaveTriggered(FormStateInterface $form_state) {
    $triggering_element = $form_state->getTriggeringElement();
    if (is_null($triggering_element)) {
      $user_input = $form_state->getUserInput();
      $autosave = isset($user_input['_triggering_element_name']) && ($user_input['_triggering_element_name'] == AutosaveFormInterface::AUTOSAVE_ELEMENT_NAME);
    }
    else {
      $autosave = $triggering_element && !empty($triggering_element['#silverback_autosave']);
    }
    return $autosave;
  }

}
