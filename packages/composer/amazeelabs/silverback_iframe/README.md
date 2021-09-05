# Silverback Iframe

This is the main module of the Silverback Iframe solution.

Other parts:

- [Drupal theme](../silverback_iframe_theme)
- [React component](../../../npm/@amazeelabs/silverback-iframe)

All together they allow embed Drupal pages (mainly forms) to React frontend.

For example, Drupal webforms can be integrated to the frontend. Most of the confirmation types are supported, so `URL with message (redirects to a custom path or URL and displays the confirmation message at the top of the page)` option will do exactly what it promises.

If there is `iframe=true` param in the URL, the module does:

- Enables `silverback_iframe_theme`.
- Removes `X-Frame-Options` header.
- Adds `iframe=true` param to all outbound URLs.
