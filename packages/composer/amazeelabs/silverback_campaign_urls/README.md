# Silverback campaign urls

The *Silverback campaign urls* module allows the Drupal admins to create campaign urls. These are basically redirects that have no restriction for the source and the destination fields, meaning that the admin can input any kind of strings into them.

These campaign urls are stored as Drupal entities, and they can be retrieved using graphql in a Gatsby app for example. An example can be found in the silverback-gatsby app (check the gatsby-node.ts file).

The endpoint to administer these redirects is */admin/config/search/campaign_url*
