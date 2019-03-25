<?php

namespace Drupal\webform_jsonschema_elements\Plugin\WebformElement;

use Drupal\webform\Plugin\WebformElement\Checkbox;

/**
 * Provides a 'checkbox' element.
 *
 * @WebformElement(
 *   id = "webform_jsonschema_toggle",
 *   label = @Translation("Toggle"),
 *   description = @Translation("Provides a toggle form element to use in JSONSchema."),
 *   category = @Translation("Basic elements"),
 * )
 */
class Toggle extends Checkbox {

}
