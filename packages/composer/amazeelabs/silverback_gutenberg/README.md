# Silverback Gutenberg

Helps integrating Drupal's [Gutenberg module](https://www.drupal.org/project/gutenberg) into Silverback projects.

## LinkProcessor

The main idea is that all links added to a Gutenberg page are

- kept in internal format (e.g. `/node/123`) when saved to Drupal database
- processed to language-prefixed aliased form (e.g. `/en/my-page`) when
  - they are displayed in Gutenberg editor
  - they are sent out via GraphQL

This helps to

- always display fresh path aliases
- be sure that the language prefix is correct
- update link URLs when translating content (e.g. `/en/my-page` will become `/fr/ma-page` automatically because it's `/node/123` under the hood)
- keep track of entity usage (TBD)

### Implementation

The module does most of the things automatically. Yet there are few things developers should take care of.

First, custom Gutenberg blocks which store links in block attributes should implement `hook_silverback_gutenberg_link_processor_block_attrs_alter`. See [`silverback_gutenberg.api.php`](./silverback_gutenberg.api.php) for an example.

Next, GraphQL resolvers which parse Gutenberg code should call `LinkProcessor::processLinks` before parsing the blocks. See [`DataProducer/Gutenberg.php`](../../../../apps/silverback-drupal/web/modules/custom/silverback_gatsby_test/src/Plugin/GraphQL/DataProducer/Gutenberg.php) for an example.
