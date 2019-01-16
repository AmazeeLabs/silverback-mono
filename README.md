# Webform JSON Schema

A Drupal module that provides /webform_jsonschema/{webform_id} REST endpoint:
- GET: returns JSON Schema + UI Schema + Form Data to be used with https://github.com/mozilla-services/react-jsonschema-form
- POST: handles the webform submission

## Known issues

- Drupal messages are shown on drupal frontend on validation errors.
- Multivalue elements should use the following setup:  
`Advanced => Multiple settings => Number of empty items => 0`  
The default value for this option is `1` and it triggers a validation error for multivalue components because it adds an empty value on submission.  
Maybe a warning should be added to the webform build form for this case.
- Bugs.
