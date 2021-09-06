# Silverback Iframe Theme

Part of [Silverback Iframe](../silverback_iframe) solution.

The theme

- displays main content without any surroundings
- adds [iframe-resizer](https://www.npmjs.com/package/iframe-resizer) library to all pages
- adds `iframeCommand.js` to all pages, the script
  - passes iframe commands to the parent frame
  - updates all visible links:
    - they should point to the parent frame base url
    - they should contain no `iframe=true` parameter
    - they should target parent frame

If you need to add CSS or [`libraries-override`](https://www.drupal.org/node/2216195#override-extend), create a sub-theme. Then the `silverback_iframe` module will use it instead of this theme.
