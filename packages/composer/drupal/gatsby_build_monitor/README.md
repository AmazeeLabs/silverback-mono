# Gatsby Build Monitor

Receives status from [gatsby-plugin-build-monitor](https://www.npmjs.com/package/gatsby-plugin-build-monitor) and displays it in the Toolbar.

## Setup

Install the module.

Generate a token:

```
drush eval 'var_dump(\Drupal\Component\Utility\Crypt::randomBytesBase64());'
```

Set the token:

```
drush cset gatsby_build_monitor.settings token '{the-token}'
```

Set the Gatsby site URL (to be used in the Toolbar):

```
drush cset gatsby_build_monitor.settings site_url '{the-url}'
```

## To disable Toolbar auto-refresh

```js
window.localStorage.setItem("gatsby_build_monitor_disable", "1");
```

To enable it back

```js
window.localStorage.removeItem("gatsby_build_monitor_disable");
```

## Tests

For now there is just an [integration test](https://github.com/AmazeeLabs/silverback-mono/tree/development/apps/silverback-gatsby/cypress/integration/build-status.ts) in `silverback-gatsby` project.
