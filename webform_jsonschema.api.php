<?php

/**
 * Alter the 'schema' part of the webform_jsonschema output.
 *
 * @param array $schema
 *   An assoc array with the schema definition.
 * @param \Drupal\webform\Entity\Webform $webform
 *   The given webform object.
 */
function hook_webform_jsonschema_schema_alter(array &$schema, Drupal\webform\Entity\Webform $webform) {
  // Change the title of an element.
  $schema['properties']['my_element']['title'] = 'I\'ve been updated from an alter hook :)';
}

/**
 * Alter the 'uiSchema' part of the webform_jsonschema output.
 *
 * @param array $uiSchema
 *   An assoc array with the uiSchema definition.
 * @param \Drupal\webform\Entity\Webform $webform
 *   The given webform object.
 */
function hook_webform_jsonschema_ui_schema_alter(array &$uiSchema, Drupal\webform\Entity\Webform $webform) {
  // Set a custom widget for an element.
  $uiSchema['my_element']['ui:widget'] = 'myCustomWidget';
}

function hook_webform_jsonschema_buttons_alter(array &$buttons, Drupal\webform\Entity\Webform $webform) {
  // Add another submit button.
  $buttons[] = [
    'type' => 'submit',
    'value' => 'Save with this button instead',
  ];
}
