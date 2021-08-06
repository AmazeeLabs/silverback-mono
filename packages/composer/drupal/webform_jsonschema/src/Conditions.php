<?php

namespace Drupal\webform_jsonschema;

use Drupal\Component\Utility\Variable;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Element;

/**
 * Functions to work with conditional logic / field dependencies.
 *
 * See module README for overview.
 */
class Conditions {

  /**
   * Applies conditional logic to a portion of JSON Schema.
   *
   * @param array $schema
   * @param \Drupal\webform_jsonschema\WebformItem[] $items
   */
  public static function apply(&$schema, $items) {
    if (empty($schema['properties'])) {
      return;
    }
    foreach ($schema['properties'] as $key => $property) {
      $item = $items[$key];
      if (!empty($item->element['#states']['required'])) {
        $triggerArray = reset($item->element['#states']['required']);
        $selector = key($item->element['#states']['required']);
        $dependencyKey = self::getDependencyKey($selector);
        $dependencySchema =& self::prepareDependencySchema($schema, $dependencyKey, $triggerArray);
        // Move the "required" mark for this item from the top of the schema to
        // the dependency field.
        self::removeRequiredMark($schema, $key);
        $dependencySchema['required'][] = $key;
      }
      if (!empty($item->element['#states']['visible'])) {
        $triggerArray = reset($item->element['#states']['visible']);
        $selector = key($item->element['#states']['visible']);
        $dependencyKey = self::getDependencyKey($selector);
        $dependencySchema =& self::prepareDependencySchema($schema, $dependencyKey, $triggerArray);
        // Move the field definition to the dependency field.
        $dependencySchema['properties'][$key] = $property;
        unset($schema['properties'][$key]);
        // Move the "required" mark for this item (if any) from the top of the
        // schema to the dependency field.
        if (self::removeRequiredMark($schema, $key)) {
          $dependencySchema['required'][] = $key;
        }
      }
    }
  }

  /**
   * Returns element key used in a states selector.
   *
   * @param string $selector
   *
   * @return string
   *
   * @throws \Exception
   */
  protected static function getDependencyKey($selector) {
    if (!preg_match('/\[name="([^"]+)"\]/', $selector, $matches)) {
      throw new \Exception('Cannot parse states selector.');
    }
    return $matches[1];
  }

  /**
   * Removes the required mark from the JSON Schema.
   *
   * @param array $schema
   * @param string $targetKey
   *
   * @return bool
   *   TRUE if the required mark was found and removed. FALSE otherwise.
   */
  protected static function removeRequiredMark(&$schema, $targetKey) {
    if (!empty($schema['required'])) {
      $arrayKey = array_search($targetKey, $schema['required'], TRUE);
      if ($arrayKey !== FALSE) {
        unset($schema['required'][$arrayKey]);
        if (empty($schema['required'])) {
          unset($schema['required']);
        }
        else {
          $schema['required'] = array_values($schema['required']);
        }
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Prepares the dependency schema.
   *
   * @see https://react-jsonschema-form.readthedocs.io/en/latest/dependencies/
   *
   * "Property dependencies" are not used, because the same result can be
   * achieved with "Schema dependencies".
   *
   * @param array $schema
   * @param string $dependencyKey
   * @param array $triggerArray
   *   Only two types are supported:
   *   - ['filled' => TRUE]
   *   - ['value' => {mixed}]
   *
   * @return array
   *   A reference to a part of dependency schema which is already inserted into
   *   the given JSON Schema.
   */
  protected static function &prepareDependencySchema(&$schema, $dependencyKey, $triggerArray) {
    $value = reset($triggerArray);
    $trigger = key($triggerArray);

    if ($schema['properties'][$dependencyKey]['type'] ?? NULL === 'boolean' && $trigger === 'filled') {
      // The issue with the checkboxes is:
      // - JSON Schema dependencies react to the presence of the field value.
      // - When a checkbox appears on a form, it's value is undefined.
      // - When a checkbox is checked, it's value in true.
      // - When checkbox is unchecked, it's value is false, but it is a defined
      //   value, so dependencies will trigger.
      // Therefore, we use the dynamic dependencies for boolean values.
      $trigger = 'value';
      $value = TRUE;
    }

    // For the "Filled" trigger we can use conditional dependencies:
    // https://react-jsonschema-form.readthedocs.io/en/latest/dependencies/#conditional
    if ($trigger === 'filled') {
      if (!isset($schema['dependencies'][$dependencyKey])) {
        $schema['dependencies'][$dependencyKey] = [];
      }
      return $schema['dependencies'][$dependencyKey];
    }

    // For the "Value is" trigger we use dynamic dependencies:
    // https://react-jsonschema-form.readthedocs.io/en/latest/dependencies/#dynamic
    if ($trigger === 'value') {
      if (!isset($schema['dependencies'][$dependencyKey]['oneOf'])) {
        $schema['dependencies'][$dependencyKey]['oneOf'] = [];
      }

      // It is important to provide all allowed values in the dependency.
      // Otherwise the form can error in unpredictable ways.
      $possibleValues = NULL;
      if (isset($schema['properties'][$dependencyKey]['anyOf'][0]['enum'][0])) {
        // Enumerable field.
        $possibleValues = array_map(function ($definition) {
          return $definition['enum'][0];
        }, $schema['properties'][$dependencyKey]['anyOf']);
      }
      if ($schema['properties'][$dependencyKey]['type'] ?? NULL === 'boolean') {
        // Boolean field.
        $possibleValues = [TRUE, FALSE];
      }
      if (!$possibleValues) {
        \Drupal::logger('webform_jsonschema')->warning('Cannot detect possible values. Data: <pre>@data</pre>', [
          '@data' => Variable::export([
            '$schema' => $schema,
            '$dependencyKey' => $dependencyKey,
            '$triggerArray' => $triggerArray,
          ]),
        ]);
        $possibleValues = [$value];
      }

      $existing = array_map(function($dependency) use ($dependencyKey) {
        return $dependency['properties'][$dependencyKey]['enum'][0];
      }, $schema['dependencies'][$dependencyKey]['oneOf']);
      $missing = array_diff($possibleValues, $existing);
      foreach ($missing as $possibleValue) {
        $schema['dependencies'][$dependencyKey]['oneOf'][]['properties'][$dependencyKey] = [
          'enum' => [$possibleValue],
        ];
      }
      foreach ($schema['dependencies'][$dependencyKey]['oneOf'] as $key => $dependency) {
        if ($dependency['properties'][$dependencyKey]['enum'][0] === $value) {
          return $schema['dependencies'][$dependencyKey]['oneOf'][$key];
        }
      }
    }

    \Drupal::logger('webform_jsonschema')->warning('Cannot prepare dependency schema. Data: <pre>@data</pre>', [
      '@data' => Variable::export([
        '$schema' => $schema,
        '$dependencyKey' => $dependencyKey,
        '$triggerArray' => $triggerArray,
      ]),
    ]);
    $nothing = [];
    return $nothing;
  }

  /**
   * Alters the webform_ui_element_form form.
   *
   * Simplifies the Webform Conditions UI to allow only those use cases which
   * could be used with react-jsonschema-form library.
   *
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   */
  public static function alterWebformUiElementForm(array &$form, FormStateInterface $form_state) {
    if (empty($form['properties']['conditional_logic'])) {
      return;
    }
    $form['properties']['conditional_logic']['states_clear']['#access'] = FALSE;
    $form['properties']['conditional_logic']['value_warning'] = [
      '#theme' => 'status_messages',
      '#message_list' => [
        'warning' => [
          t('Please note that "@value" trigger works with enumerable field only. E.g. with selects, radio buttons, etc.', [
            '@value' => t('Value is'),
          ]),
          ],
      ],
    ];
    $form['properties']['conditional_logic']['states']['#after_build'][] = [
      self::class,
      'webformElementStatesAfterBuild',
    ];
  }

  /**
   * After-build callback for the webform_element_states form element.
   *
   * @param array $element
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *
   * @return array
   */
  public static function webformElementStatesAfterBuild($element, FormStateInterface $form_state) {
    /** @var \Drupal\webform_ui\Form\WebformUiElementFormInterface $formObject */
    $formObject = $form_state->getFormObject();
    /** @var \Drupal\webform\Entity\Webform $webform */
    $webform = $formObject->getWebform();
    /** @var \Drupal\webform_jsonschema\Transformer $transformer */
    $transformer = \Drupal::service('webform_jsonschema.transformer');
    $webformItems = $transformer->toItems($webform);

    // Get webform element keys from the same level as the currently processed
    // webform element.
    $parentKey = $form_state->getCompleteForm()['parent_key']['#value'] ?? NULL;
    $elementKey = $form_state->getBuildInfo()['args'][1] ??  NULL;
    if ($parentKey === NULL && $elementKey === NULL) {
      // We add a new element on the root level.
      $elementKeysFromSameLevel = array_keys($webformItems);
    }
    elseif ($parentKey !== NULL) {
      // We add a new element.
      $getByParent = function($webformItems, $parentKey) use (&$getByParent) {
        foreach ($webformItems as $key => $webformItem) {
          if ($key === $parentKey) {
            return array_keys($webformItem->children);
          }
          $result = $getByParent($webformItem->children, $parentKey);
          if ($result) {
            return $result;
          }
        }
        return [];
      };
      $elementKeysFromSameLevel = $getByParent($webformItems, $parentKey);
    }
    elseif ($elementKey !== NULL) {
      // We edit an existing element.
      $getByTarget = function($webformItems, $targetKey) use (&$getByTarget) {
        if (isset($webformItems[$targetKey])) {
          return array_keys($webformItems);
        }
        foreach ($webformItems as $key => $webformItem) {
          $result = $getByTarget($webformItem->children, $targetKey);
          if ($result) {
            return $result;
          }
        }
        return [];
      };
      $elementKeysFromSameLevel = $getByTarget($webformItems, $elementKey);
      // Exclude the element itself.
      $elementKeysFromSameLevel = array_diff($elementKeysFromSameLevel, [$elementKey]);
    }
    else {
      // Should never happen.
      \Drupal::logger('webform_jsonschema')->warning('Cannot detect elements from the same level. Data: <pre>@data</pre>', [
        '@data' => Variable::export([
          '$elementKey' => $elementKey,
          '$parentKey' => $parentKey,
          '$webform->id()' => $webform->id(),
        ]),
      ]);
      $elementKeysFromSameLevel = [];
    }

    // Adjust the form.
    foreach (Element::children($element['states']) as $key) {
      $row =& $element['states'][$key];
      $isFirstRow = isset($row['state']) && !isset($row['selector']);
      $isSecondRow = !$isFirstRow;
      if ($isFirstRow) {
        // Limit states to Visible and Required.
        $row['state']['#options'] = [
          '' => t('- Select- '),
          'visible' => t('Visible'),
          'required' => t('Required'),
        ];
        // Allow only one condition per state.
        $row['operator'] = [
          '#markup' => t('if the following is met:'),
          // Fix a PHP notice which happens because "operator" is supposed to be
          // a form element.
          '#parents' => [],
        ];
        $row['operations']['add']['#access'] = FALSE;
      }
      if ($isSecondRow) {
        // Allow only one condition per state.
        $row['operations']['add']['#access'] = FALSE;
        $row['operations']['remove']['#access'] = FALSE;
        // Dependency fields should be on the same level.
        foreach (array_keys($row['selector']['#options']) as $selector) {
          if (!$selector) {
            continue;
          }
          $dependencyKey = self::getDependencyKey($selector);
          if (!in_array($dependencyKey, $elementKeysFromSameLevel, TRUE)) {
            unset($row['selector']['#options'][$selector]);
          }
        }
        // Limit triggers to "Filled" and "Value is".
        $row['condition']['trigger']['#options'] = array_intersect_key(
          $row['condition']['trigger']['#options'],
          array_fill_keys(['', 'filled', 'value'], NULL)
        );
      }
      unset($row);
    }
    $element['actions']['source']['#access'] = FALSE;

    return $element;
  }

}
