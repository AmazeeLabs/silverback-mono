# Silverback Iframe

This is the main module of the Silverback Iframe solution.

Other parts:

- [Drupal theme](../silverback_iframe_theme)
- [React component](../../../npm/@amazeelabs/silverback-iframe)

All together they allow embed Drupal pages (mainly forms) to React frontend.

For example, Drupal webforms can be integrated to the frontend. Most of the
confirmation types are supported, so
`URL with message (redirects to a custom path or URL and displays the confirmation message at the top of the page)`
option will do exactly what it promises.

If there is `iframe=true` param in the URL, the module does:

- Enables `silverback_iframe_theme`.
- Removes `X-Frame-Options` header.
- Adds `iframe=true` param to all outbound URLs.
- adds [iframe-resizer](https://www.npmjs.com/package/iframe-resizer) library to
  all pages
- adds `iframeCommand.js` to all pages, the script
  - passes iframe commands to the parent frame
  - updates all visible links:
    - they should point to the parent frame base url
    - they should contain no `iframe=true` parameter
    - they should target parent frame

## Installation

Drupal:

- `composer require amazeelabs/silverback_iframe amazeelabs/silverback_iframe_theme`
- `drush en silverback_iframe`
- `drush then silverback_iframe_theme`
- if needed: create a custom theme based on `silverback_iframe_theme` and enable
  it
- configure which blocks to display with `silverback_iframe_theme` (or your
  sub-theme) at `/admin/structure/block`

React frontend:

- `pnpm add @amazeelabs/silverback-iframe`
- use `SilverbackIframe` component
