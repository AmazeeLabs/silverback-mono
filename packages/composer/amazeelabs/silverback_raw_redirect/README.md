# Silverback raw redirect

The silverback raw redirect module allows the Drupal admins to create raw redirects. These redirects have basically no restriction for the source and the destination fields, meaning that the admin can input any kind of strings into them. These are useful for example to create campaign urls (urls which have not language, similar to short urls) or to create absolute redirects between the domains of the same application.

These redirects are stored as Drupal entities and they can be retrieved using graphql in a Gatsby app for example. An example can be found in the silverback-gatsby app (check the gatsby-node.ts file).

The endpoint to administer these redirects is */admin/config/search/raw_redirect*
