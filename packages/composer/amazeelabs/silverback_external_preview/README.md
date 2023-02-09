# Silverback external preview

Provides a UI to preview pages (published and draft) on an external website -
usually a Gatsby or NextJS frontend.

## Drupal config

- Enable the module
- Set the settings, for example:
  ```
  drush cset silverback_external_preview.settings preview_host http://localhost:8000
  drush cset silverback_external_preview.settings live_host http://localhost:9000
  ```
