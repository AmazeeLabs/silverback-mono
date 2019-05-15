<?php

namespace Drupal\webform_jsonschema;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Render\Element;
use Drupal\webform\Entity\Webform;
use Drupal\webform\Plugin\WebformElement\WebformCompositeBase;
use Drupal\webform_jsonschema\JsonSchemaElementInterface;

/**
 * Transforms webforms to JSON Schema.
 */
class Transformer {

  /**
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * Transformer constructor.
   *
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   */
  public function __construct(ModuleHandlerInterface $moduleHandler) {
    $this->moduleHandler = $moduleHandler;
  }

  /**
   * Transforms a webform to JSON Schema.
   *
   * @param \Drupal\webform\Entity\Webform $webform
   *
   * @return array
   */
  public function toJsonSchema(Webform $webform) {
    $schema = [
      'title' => $webform->label(),
    ] + self::itemsToSchema($this->toItems($webform));
    $this->moduleHandler->alter(
      'webform_jsonschema_schema', $schema, $webform);
    return $schema;
  }

  /**
   * Transforms a webform to UI Schema.
   *
   * @param \Drupal\webform\Entity\Webform $webform
   *
   * @return array
   */
  public function toUiSchema(Webform $webform) {
    $uiSchema = self::itemsToUiSchema($this->toItems($webform));

    // Provide a general validation error message that can be displayed on the
    // top of the form.
    // Unfortunately, the standard error message from
    // \Drupal\inline_form_errors\FormErrorHandler::displayErrorMessages is too
    // hard to generate and use. So we go with a custom one.
    $uiSchema['webform:generalValidationErrorMessage'] = (string) t('A form validation error occurred. Please check the values you have entered.');
    // And a one for a general submission error.
    $uiSchema['webform:generalSubmissionErrorMessage'] = (string) t('There was an error submitting webform.');

    $this->moduleHandler->alter(
      'webform_jsonschema_ui_schema', $uiSchema, $webform);
    return $uiSchema;
  }

  /**
   * Extracts the button definitions from the UI schema.
   *
   * @param \Drupal\webform\Entity\Webform $webform
   *
   * @return array
   */
  public function toButtons(Webform $webform) {
    $buttons = self::itemsToButtons($this->toItems($webform));
    $this->moduleHandler->alter(
      'webform_jsonschema_buttons', $buttons, $webform);
    return $buttons;
  }

  /**
   * Transforms a webform to WebformItem's.
   *
   * @param \Drupal\webform\Entity\Webform $webform
   *
   * @return \Drupal\webform_jsonschema\WebformItem[]
   */
  public function toItems(Webform $webform) {
    $elements = $webform->getElementsInitialized();
    return self::getStructureElements($elements);
  }

  /**
   * Creates a JSON Schema out of WebformItem's.
   *
   * @param \Drupal\webform_jsonschema\WebformItem[] $items
   *
   * @return array
   */
  protected static function itemsToSchema($items) {
    $schema = [
      'type' => 'object',
    ];


    foreach ($items as $key => $item) {
      if (!empty($item->element['#required'])) {
        $schema['required'][] = $key;
      }
      $properties = [
        'title' => (string) $item->elementPlugin->getLabel($item->element),
      ];
      if ($item->element['#type'] === 'container') {
        $properties['title'] = '';
      }
      if ($item->elementPlugin->isComposite()) {
        $properties['is_composite_element'] = TRUE;
      }
      if ($item->children) {
        $properties['is_wrapper_element'] = TRUE;
        $properties += self::itemsToSchema($item->children);
      }
      else {
        $ignore = [
          'value',
          'webform_element', // No idea what this is.
        ];
        if (!isset($item->element['#type']) || in_array($item->element['#type'], $ignore, TRUE)) {
          $properties = [];
        }
        elseif ($item->elementPlugin instanceof JsonSchemaElementInterface) {
          $item->elementPlugin->addJsonSchema($properties, $item->element);
        }
        elseif ($item->element['#type'] === 'checkbox') {
          $properties['type'] = 'boolean';
        }
        elseif ($item->element['#type'] === 'textarea') {
          $properties['type'] = 'string';
        }
        elseif ($item->element['#type'] === 'textfield') {
          $properties['type'] = 'string';
          if (isset($item->element['#pattern'])) {
            $properties['pattern'] = $item->element['#pattern'];
          }
        }
        elseif ($item->element['#type'] === 'hidden') {
          $properties['type'] = 'string';
        }
        elseif (
          $item->element['#type'] === 'select' ||
          $item->element['#type'] === 'webform_buttons' ||
          $item->element['#type'] === 'checkboxes' ||
          $item->element['#type'] === 'radios' ||
          $item->element['#type'] === 'tableselect' ||
          $item->element['#type'] === 'webform_tableselect_sort' ||
          $item->element['#type'] === 'webform_table_sort' ||
          // These define an option widget with one special "Other..." item
          // which allows to add a custom value in addition to the default
          // options. This cannot be implemented with default
          // react-jsonschema-form tools. Therefore we stick to the default
          // options only.
          $item->element['#type'] === 'webform_select_other' ||
          $item->element['#type'] === 'webform_checkboxes_other' ||
          $item->element['#type'] === 'webform_radios_other' ||
          $item->element['#type'] === 'webform_buttons_other'
        ) {
          // TODO: currently all option keys are assumed to be strings, but
          //   maybe other types need to be considered.
          $properties['type'] = 'string';
          $properties['anyOf'] = array_map(function($key, $value) {
            return [
              'enum' => [
                (string) $key,
              ],
              'title' => (string) $value,
            ];
          }, array_keys($item->element['#options']), $item->element['#options']);
          $properties['uniqueItems'] = TRUE;
        }
        elseif ($item->element['#type'] === 'number') {
          $properties['type'] = 'number';
          if (isset($item->element['#min'])) {
            $properties['minimum'] = $item->element['#min'];
          }
          if (isset($item->element['#max'])) {
            $properties['maximum'] = (float) $item->element['#max'];
          }
          if (isset($item->element['#step'])) {
            $properties['multipleOf'] = (float) $item->element['#step'];
          }
        }
        elseif ($item->element['#type'] === 'email') {
          $properties['type'] = 'string';
          $properties['format'] = 'email';
        }
        elseif ($item->element['#type'] === 'url') {
          $properties['type'] = 'string';
          $properties['format'] = 'uri';
        }
        elseif ($item->element['#type'] === 'tel') {
          $properties['type'] = 'string';
        }
        elseif ($item->element['#type'] === 'datetime') {
          $properties['type'] = 'string';
          $properties['format'] = 'date-time';
        }
        elseif ($item->element['#type'] === 'date') {
          $properties['type'] = 'string';
          $properties['format'] = 'date';
        }
        elseif ($item->element['#type'] === 'webform_time') {
          $properties['type'] = 'string';
        }
        else {
          // Not supported yet.
          $properties = [];
        }
      }
      if (!empty($properties)) {
        if ($multivalue = $item->elementPlugin->hasMultipleValues($item->element)) {
          $properties = [
            'type' => 'array',
            'items' => $properties,
          ];
          $top_properties = [
            'title',
            'description',
            'uniqueItems',
          ];
          foreach ($top_properties as $top_property) {
            if (isset($properties['items'][$top_property])) {
              $properties[$top_property] = $properties['items'][$top_property];
              unset($properties['items'][$top_property]);
            }
          }
          if (is_numeric($multivalue)) {
            $properties['maxItems'] = $multivalue;
          }
          if (!isset($properties['minItems']) && !empty($item->element['#required'])) {
            $properties['minItems'] = 1;
          }
        }
        $schema['properties'][$key] = $properties;
      }
    }

    return $schema;
  }

  /**
   * Transforms webform elements to WebformItem's.
   *
   * @param array $elements
   *
   * @return \Drupal\webform_jsonschema\WebformItem[]
   */
  protected static function getStructureElements($elements) {
    $element_manager = \Drupal::service('plugin.manager.webform.element');
    $items = [];
    foreach ($elements as $key => $element) {
      /** @var \Drupal\webform\Plugin\WebformElementInterface $element_plugin */
      $element_plugin = $element_manager->getElementInstance($element);
      $item = new WebformItem();
      $item->element = $element;
      $item->elementPlugin = $element_plugin;
      if ($element_plugin->isComposite() && $element_plugin instanceof WebformCompositeBase) {
        $children = $element_plugin->getInitializedCompositeElement($element);
        $item->children = self::getStructureElements($children);
      }
      elseif ($children_keys = Element::children($element)) {
        $children = array_intersect_key($element, array_flip($children_keys));
        $item->children = self::getStructureElements($children);
      }
      if (!isset($item->element['#access']) || $item->element['#access']) {
        $items[$key] = $item;
      }
    }
    return $items;
  }

  /**
   * Creates a UI Schema out of WebformItem's.
   *
   * @param \Drupal\webform_jsonschema\WebformItem[] $items
   *
   * @return array
   */
  protected static function itemsToUiSchema(array $items) {
    $ui_schema = [];
    foreach ($items as $key => $item) {
      $ui_schema[$key] = [];

      if ($item->element['#type'] === 'textarea') {
        $ui_schema[$key]['ui:widget'] = 'textarea';
      }
      elseif ($item->elementPlugin instanceof JsonSchemaElementInterface) {
        $item->elementPlugin->addJsonSchemaUiSchema($ui_schema[$key], $item->element);
      }
      elseif (
        $item->element['#type'] === 'webform_buttons' ||
        $item->element['#type'] === 'checkboxes' ||
        $item->element['#type'] === 'webform_buttons_other' ||
        $item->element['#type'] === 'webform_checkboxes_other'
      ) {
        $ui_schema[$key]['ui:widget'] = 'checkboxes';
      }
      elseif (
        $item->element['#type'] === 'radios' ||
        $item->element['#type'] === 'webform_radios_other'
      ) {
        $ui_schema[$key]['ui:widget'] = 'radio';
      }

      if (
        isset($item->element['#webform_jsonschema']['uiSchema']) &&
        is_array($item->element['#webform_jsonschema']['uiSchema'])
      ) {
        $ui_schema[$key] = NestedArray::mergeDeepArray([
          $ui_schema[$key],
          $item->element['#webform_jsonschema']['uiSchema'],
        ]);
      }

      if ($item->children) {
        $ui_schema[$key] += self::itemsToUiSchema($item->children);
      }

      // Provide error messages to frontend so that they can be used with
      // react-jsonschema-form's `transformErrors` option. See
      // https://react-jsonschema-form.readthedocs.io/en/latest/validation/#custom-error-messages
      //
      // The errors keys are "Validation Keywords" from the "JSON Schema
      // Validation" specification. See
      // https://json-schema.org/latest/json-schema-validation.html#rfc.section.6
      //
      // If an element does not provide a custom error message, use the standard
      // one which would be used by Webform module or Drupal core.
      if (!empty($item->element['#required'])) {
        $message = !empty($item->element['#required_error'])
          ? $item->element['#required_error']
          : t('@name field is required.', ['@name' => $item->element['#title']]);
        $message = strip_tags((string) $message);
        if ($item->elementPlugin->hasMultipleValues($item->element)) {
          // For the required multivalue elements we use minItems=1 in
          // Transformer::itemsToSchema. So on the frontend the `error.name`
          // will be "minItems", but the actual meaning will be that the element
          // is required.
          $ui_schema[$key]['webform:validationErrorMessages']['minItems'] = $message;
        }
        else {
          $ui_schema[$key]['webform:validationErrorMessages']['required'] = $message;
        }
      }
      if (isset($item->element['#pattern'])) {
        $message = !empty($item->element['#pattern_error'])
          ? $item->element['#pattern_error']
          : t('%name field is not in the right format.', ['%name' => $item->element['#title']]);
        $message = strip_tags((string) $message);
        $ui_schema[$key]['webform:validationErrorMessages']['pattern'] = $message;
      }

      if (empty($ui_schema[$key])) {
        // Prevent empty array/object PHP-to-JSON conversion issues by removing
        // empty items.
        unset($ui_schema[$key]);
      }
    }
    return $ui_schema;
  }

  /**
   * Creates an array of buttons out of the WebformItems.
   *
   * @param \Drupal\webform_jsonschema\WebformItem[] $items
   *
   * @return array
   */
  protected static function itemsToButtons($items) {
    $buttons = [];
    foreach ($items as $key => $item) {
      if ($item->elementPlugin instanceof JsonSchemaElementInterface) {
        $item->elementPlugin->addJsonSchemaButtons($buttons, $item->element);
      }
      elseif ($item->element['#type'] == 'webform_actions') {
        $buttons[] = [
          // Now we just have submit, but we might want to introduce other
          // button later, e.g. reset.
          'type' => 'submit',
          'value' => $item->element['#title'],
        ];
      }
    }
    return $buttons;
  }

}
