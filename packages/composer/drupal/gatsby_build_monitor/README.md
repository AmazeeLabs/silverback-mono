# Gatsby Build Monitor

Receives status from [gatsby-plugin-build-monitor](../../../npm/gatsby-plugin-build-monitor) and displays it in the Toolbar.

## Setup

Install the module as usual.

To generate a token:
```
drush eval 'var_dump(\Drupal\Component\Utility\Crypt::randomBytesBase64());'
```

To set the token:
```
drush cset gatsby_build_monitor.settings token {the-token}
```

To set the Gatsby site URL (to be used in the Toolbar):
```
drush cset gatsby_build_monitor.settings site_url {the-url}
```

## Tests

For now there is just an [integration test](https://github.com/AmazeeLabs/silverback-mono/tree/development/apps/silverback-gatsby/cypress/integration/build-status.ts) in `silverback-gatsby` project.
