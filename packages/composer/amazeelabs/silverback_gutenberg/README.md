# Silverback Gutenberg

Helps integrating Drupal's
[Gutenberg module](https://www.drupal.org/project/gutenberg) into Silverback
projects.

## GraphQL directives

This module provides a set of GraphQL directives that are picked up by the
`amazeelabs/graphql_directives` module. This allows to easily expose Gutenberg
blocks through a GraphQL schema.

### `@resolveEdtiorBlocks`

Parse the raw output of a field at a given path and expose its content as
structured block data. Allows to define `aggregated` and `ignored` blocks:

- `aggregated`: All subsequent blocks of these types will be merged into one
  `core/paragraph` block. In Gutenberg, standard HTML elements like lists,
  headings or tables are represented as separate blocks. This directive allows
  to merge them into one and simplify handling in the frontend.
- `ignored`: Blocks of these types will be ignored. This is useful for blocks
  that are not relevant for the frontend, like the `core/group` block. The block
  will simply not part of the result and any children are spread where the block
  was.

```graphql
type Page {
  title: String! @resolveProperty(path: "title.value")
  content: [Blocks!]!
    @resolveEditorBlocks(
      path: "body.value"
      aggregated: ["core/paragraph", "core/list"]
      ignored: ["core/group"]
    )
}
```

### `@resolveEditorBlockType`

Retrieve the type of gutenberg block. Useful for resolving types of a block
union.

```graphql
union Blocks @resolveEditorBlockType = Paragraph | Heading | List
```

### `@resolveEditorBlockMarkup`

Extract inner markup of a block that was provided by the user via rich HTML.

```graphql
type Text @type(id: "core/paragraph") {
  content: String @resolveEditorBlockMarkup
}
```

### `@resolveEditorBlockAttribute`

Retrieve a specific attribute, stored in a block.

```graphql
type Figure @type(id: "custom/figure") {
  caption: String @resolveEditorBlockAttribute(key: "caption")
}
```

### `@resolveEditorBlockMedia`

Resolve a media entity referenced in a block.

```graphql
type Figure @type(id: "custom/figure") {
  image: Image @resolveEditorBlockMedia
}
```

### `@resolveEditorBlockChildren`

Extract all child blocks of a given block.

```graphql
type Columns @type(id: "custom/columns") {
  columns: [ColumnBlocks!]! @resolveEditorBlockChildren
}
```

## LinkProcessor

The main idea is that all links added to a Gutenberg page are

- kept in internal format (e.g. `/node/123`) when saved to Drupal database
- processed to language-prefixed aliased form (e.g. `/en/my-page`) when
  - they are displayed in Gutenberg editor
  - they are sent out via GraphQL

This helps to

- always display fresh path aliases
- be sure that the language prefix is correct
- update link URLs when translating content (e.g. `/en/my-page` will become
  `/fr/ma-page` automatically because it's `/node/123` under the hood)
- keep track of entity usage (TBD)

### Implementation

The module does most of the things automatically. Yet there are few things
developers should take care of.

First, custom Gutenberg blocks which store links in block attributes should
implement `hook_silverback_gutenberg_link_processor_block_attrs_alter`. See
[`silverback_gutenberg.api.php`](./silverback_gutenberg.api.php) for an example.

Next, GraphQL resolvers which parse Gutenberg code should call
`LinkProcessor::processLinks` before parsing the blocks. See
[`DataProducer/Gutenberg.php`](../../../../apps/silverback-drupal/web/modules/custom/silverback_gatsby_test/src/Plugin/GraphQL/DataProducer/Gutenberg.php)
for an example.

## Validation

Custom validator plugins can be created in
`src/Plugin/Validation/GutenbergValidator`

Example, to validate an email field that is also required.

- the block name is `custom/my-block`
- the field attribute is `email` and the label `Email`

```php
<?php

namespace Drupal\custom_gutenberg\Plugin\Validation\GutenbergValidator;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * @GutenbergValidator(
 *   id="my_block_validator",
 *   label = @Translation("My block validator")
 * )
 */
class MyBlockValidator extends GutenbergValidatorBase {

  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block) {
    return $block['blockName'] === 'custom/my-block';
  }

  /**
   * {@inheritDoc}
   */
  public function validatedFields($block = []) {
    return [
      'email' => [
        'field_label' => $this->t('Email'),
        'rules' => ['required', 'email'],
      ],
    ];
  }

}
```
