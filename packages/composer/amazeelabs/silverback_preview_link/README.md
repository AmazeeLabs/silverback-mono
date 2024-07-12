# Silverback Preview Link

Decoupled shareable preview with access token. Integrates with Silverback
autosave.

This module is inspired by
[Preview Link](https://www.drupal.org/project/preview_link) but does not depend
on it as the use case is different.

This module

- is suitable for a decoupled setup
- handles access based on GraphQL
- uses silverback_autosave to share instant preview updates
- integrates with the Gutenberg editor

Due to the decoupled nature, it does not cover additional logic brought by the
Preview Link module:

- Most of the route subscribers
- Entity canonical access control handlers
- Route provider and Controller for preview links
- Event subscribers for node canonical redirect
- ...

## Configuration

- Enable entity types and bundles
  `/admin/config/content/silverback_preview_link`
- Optionally change the default expiry time that is set to 1 day
