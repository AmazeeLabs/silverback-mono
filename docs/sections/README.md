# Sections editor

## Preface

The [CKEditor5 Sections module] for Drupal allows to create custom WYSIWYG 
interfaces for complex document structures by composing simple html templates.

## Installation

## Configuration

### Master template mode

## Creating templates

### Data binding

An editor template can be annotated with microdata attributes `itemtype` and
`itemprop`. Using this information the engine is able to extract structured data
from a document created with the editor.

The following rules apply:

* If an element has an `itemtype` attribute, it is treated like an object.
  * The typename will be extracted to the `__type` property.
  * The HTML content will be extracted to the `__content` property.  
  ***TODO:** This doesn't have to happen for each element. Define a sensible
  rule for that.*
  * All attributes except `class` and `data-` are copied over to the result.
  * `data-*` attributes are converted according to [HTML datasets].
* If an element has an `itemprop` attribute, it will be attached to the parent
with the defined property name.
  * If the element has *no* `itemtype` attribute, the elements html content
  is used as the result value.
  * If the element *does* have an `itemtype` attribute, the complex result 
  object is used as the result value.
  
[HTML datasets]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset

### Example template
<<< @/sections/example/template.html{2,9,10,20,29,38,39}

### Example document
```html
<div class="teaser" data-layout="image-left">
    <div class="teaser__image"
         data-media-uuid="123"
         data-media-type="image">
    </div>
    <div class="teaser__content">
        <h2 class="teaser__headline">Headline</h2>
        <div class="teaser__text">Teaser <em>content</em></h2>
        <a href="/node/1" class="teaser__link">Link text</a>
    </div>
</div>
```

### Example data
```yaml
__type: teaser
image:
  __type: image
  mediaType: image
  mediaUuid: 123
headline: Headline
text: Teaser <em>content</em>
link:
  __type: button
  href: /node/1
  __content: Link text
```

## Local editor build

## Custom components
