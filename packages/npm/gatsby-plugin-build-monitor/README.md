# Build Monitor

A Gatsby plugin which pings an endpoint when `gatsby build` starts and finishes.

The endpoint is pinged with a POST request. The JSON payload is described in the
`Payload` interface. See scr/gatsby-node.ts file.

## Setup

Install the package and set the following environment variables:

- `GATSBY_PLUGIN_BUILD_MONITOR_ENDPOINT`: the endpoint URL
- `GATSBY_PLUGIN_BUILD_MONITOR_TOKEN`: the token to be sent in `token` header

## Integrations

- Drupal:
  [gatsby_build_monitor](https://github.com/AmazeeLabs/silverback-mono/tree/development/packages/composer/drupal/gatsby_build_monitor)

## Tests

For now there is just an
[integration test](https://github.com/AmazeeLabs/silverback-mono/tree/development/apps/silverback-gatsby/cypress/integration/build-status.ts)
in `silverback-gatsby` project.
