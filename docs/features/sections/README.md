# Sections editor

## Preface

The [CKEditor5 Sections module] for Drupal allows to create custom WYSIWYG 
interfaces for complex document structures by composing simple html templates.

[CKEditor5 Sections module]: http://drupal.org/project/sections

## Installation

TODO

## Configuration

TODO

### Master template mode

TODO

## Creating templates

TODO

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
```html
<div class="teaser" itemtype="teaser" data-layout="">

  <div ck-type="drupal-media"
       data-media-type="image"
       itemprop="image"
       itemtype="image"
       class="teaser__image"
  ></div>

  <div class="teaser__content">

    <h2 ck-type="text"
        itemprop="headline"
        class="teaser__headline"
    >Headline placeholder</h2>

    <div ck-type="text"
         itemprop="text"
         class="teaser__text"
    >Teaser content placeholder
    </div>

    <a ck-type="button"
       itemtype="button"
       itemprop="link"
       class="teaser__link"
    >Link text placeholder</a>

  </div>
</div>
```
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

## Contributing

`amazeelabs/silverback` will by default pull the latest version of the module
from [drupal.org](http://www.drupal.org/project/ckeditor5_sections). If you
intend to contribute to the module and use the latest version you might want to
depend on the most recent build from [github](http://github.com/AmazeeLabs/ckeditor5_sections) instead.

In this case you have to add a new repository to your projects `composer.json`:

```json
{
  "repositories": [
    {
      "type": "package",
      "package": {
        "name": "drupal/ckeditor5_sections",
        "version": "8.x-1.x-dev",
        "type": "drupal-module",
        "source": {
          "type": "git",
          "url": "https://github.com/AmazeeLabs/ckeditor5_sections.git",
          "reference": "8.x-1.x"
        }
      }
    }
  ]
}
```

And require it while *"pretending"* to use the latest stable to calm the gods of
version constraints:

```bash
composer require drupal/ckeditor5_sections:"8.x-1.x-dev as 1.0"
```

### CKEditor5 packages

Apart from the packages provided by CKSource, this module uses three packages
maintained by Amazee Labs:

* **[@amazeelabs/ckeditor5-template](http://github.com/Amazeelabs/ckeditor5-template)**: Templating mechanisms, containers and
overall editor logic.
* **[@amazeelabs/ckeditor5-drupal-linkit](http://github.com/Amazeelabs/ckeditor5-drupal-linkit)**: Integration with the [LinkIt](http://drupal.org/project/linkit) module.
* **[@amazeelabs/ckeditor5-drupal-media](http://github.com/Amazeelabs/ckeditor5-drupal-media)**: For embedding media entities in documents.

To work on these packages, please head over to the forked [ckeditor5](http://github.com/AmazeeLabs/ckeditor5) repository. Information how to use it can be obtained from the [official documentation](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/contributing/development-environment.html). For a general introduction to CKEditor5 development have a look at the [plugin development guide](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/quick-start.html).

### Custom components

The editor also uses a set of custom web components, that are maintained in a
[separate repository](http://github.com/AmazeeLabs/editor-components). They are
built upon the [LitElement](https://lit-element.polymer-project.org/) framework.

The repository also contains a storybook setup to showcase and test all components.
Just run `yarn run storybook` and you are ready to go.

### Building the editor

After updating any of the packages above, they have to be pulled into the
`ckeditor5_sections` module. To do that, navigate into the `editor` directory of
the module and run `yarn upgrade-packages`. After that the editor can be rebuilt
using `yarn build`. The compiled assets should be committed to the module to make
them available on install.

