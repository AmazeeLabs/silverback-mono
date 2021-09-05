# Gatsby Fast Builds

This is a simple local version of Gatsby Cloud.

`yarn fast-builds:run:local` (used for local testing) does the following:

- Gatsby is started with `gatsby build && gatsby serve`
- `POST http://localhost:9001/__rebuild` endpoint re-runs `gatsby build` and
  restarts `yarn serve`

It's called "Fast" because the cache is preserved between the rebuilds and
Gatsby fetches only new/changed data from Drupal.
