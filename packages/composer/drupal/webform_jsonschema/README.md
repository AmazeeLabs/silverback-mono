# Webform JSON Schema

☝️ Development happens in https://github.com/AmazeeLabs/silverback-mono/tree/development/packages/composer/drupal/webform_jsonschema

A Drupal module that provides /webform_jsonschema/{webform_id} REST endpoint:

- GET: returns JSON Schema + UI Schema + Form Data to be used with https://github.com/mozilla-services/react-jsonschema-form
- POST: handles the webform submission

The REST module is not listed as a dependency. It needs to be enabled manually.

## Known issues

- Drupal messages are shown on drupal frontend on validation errors.
- Multivalue elements should use the following setup:  
  `Advanced => Multiple settings => Number of empty items => 0`  
  The default value for this option is `1` and it triggers a validation error for multivalue components because it adds an empty value on submission.  
  Maybe a warning should be added to the webform build form for this case.
- Bugs.

## Tricks

It's easy to override uiSchema:

- edit a webform component
- go to Advanced tab
- add something like this to the "Custom properties" field:

```
webform_jsonschema:
  uiSchema:
    'ui:widget': carSelector
```

- result: the `ui:widget` in the uiSchema will be overridden with `carSelector` for the component

## Field conditions (dependencies)

The module supports field conditions. But only a limited portion of them due to limitations of the JSON Schema: https://json-schema.org/understanding-json-schema/reference/object.html#dependencies
However `react-jsonschema-form` uses a bit extended dependencies allowing to depend not only on the field presence, but also on the field value: https://react-jsonschema-form.readthedocs.io/en/latest/dependencies/#dynamic

Limitations, in comparison with the default Webform conditions (Drupal states):

- only `Visible` and `Required` states are available
- one state can have only one trigger
- only `Filled` and `Value is` triggers are available
- `Value is` trigger works correctly only with enumerable fields
- the dependency field should be on the same level with the target field

The webform_jsonschema module provides a way to apply the above limitations to the Webform UI. But the module does not apply them automatically, because it does not know which of the forms will be used with `react-jsonschema-form`. Here is an example of how to apply them:

```
/**
 * Implements hook_form_FORM_ID_alter().
 */
function MY_MOFULE_form_webform_ui_element_form_alter(array &$form, FormStateInterface $form_state) {
  // Streamline Webform conditions UI on all webforms / webform elements.
  Conditions::alterWebformUiElementForm($form, $form_state);
}
```
