<?php

namespace Drupal\webform_jsonschema;

/**
 * Interface for (webform) elements that integrate with JsonSchema.
 */
interface JsonSchemaElementInterface {

  /**
   * Returns the schema (properties) portion of the output.
   *
   * @param array &$property
   *   The property definition array.
   * @param array $element
   *   The Webform element.
   *
   * @return array
   *
   * @see https://mozilla-services.github.io/react-jsonschema-form/
   */
  public function addJsonSchema(&$property, $element);

  /**
   * Returns the uiSchema portion of the output (e.g. custom widget mapping).
   *
   * @param array $property
   *   The UI Schema array for this field.
   * @param array $element
   *   The Webform element.
   *
   * @return array
   *
   * @see https://mozilla-services.github.io/react-jsonschema-form/
   */
  public function addJsonSchemaUiSchema(&$property, $element);

  /**
   * Returns a list of buttons to append to the form.
   *
   * @param array $buttons
   *   An array of buttons.
   * @param array $element
   *   The Webform element.
   *
   * @return array
   *
   * @see \Drupal\webform_jsonschema\Plugin\rest\resource\WebformJsonSchemaResource::get();
   */
  public function addJsonSchemaButtons(&$buttons, $element);

}
