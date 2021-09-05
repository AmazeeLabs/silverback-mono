# Silverback Iframe Theme

Part of [Silverback Iframe](../silverback_iframe) solution.

The theme

- displays main content without any surroundings
- adjusts some other Drupal modules to expose less CSS
- adds [iframe-resizer](https://www.npmjs.com/package/iframe-resizer) library to all pages
- adds `iframeCommand.js` to all pages, the script
  - passes iframe commands to the parent frame
  - updates all visible links:
    - they should point to the parent frame base url
    - they should contain no `iframe=true` parameter
    - they should target parent frame
