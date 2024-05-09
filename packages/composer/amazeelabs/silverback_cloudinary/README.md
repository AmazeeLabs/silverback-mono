# Silverback Cloudinary

This module provides a graphql data producer that can be used to load
(responsive) images using the [Cloudinary](https://cloudinary.com/) service.

The data producer takes as parameters the original image url, and optionally the
width, height, sizes and a arbitrary cloudinary transformation string and
produces a json encoded string containing the html properties of the image (src,
width, height, sizes, srcset).

```graphql
type Page {
  heroImage(
    width: Int
    height: Int
    sizes: [[Int!]!]
    transform: String
  ): String
}
```

You can use the data producer like that:

```php
  addResolver('Page.heroImage',
    $builder->compose(
      // ...any other calls to data producers or callbacks that will return a string (image url), for example:
      //$builder->callback(function ($value) {
      //  return 'http://www.example.com/demo.jpg';
      //}),
      $builder->produce('responsive_image')
        ->map('image', $builder->fromParent())
        ->map('width', $builder->fromArgument('width'))
        ->map('height', $builder->fromArgument('height'))
        ->map('sizes', $builder->fromArgument('sizes'))
        ->map('transform', $builder->fromArgument('transform'))
      )
    )
  );
```

When no width is supplied, the returned data will just consist of the original
image url, encoded as json

Then you can query data like this:

```graphql
fragment Hero on Page {
  heroImage(
    # Display a 1600/800 header image by default.
    width: 1600
    height: 800
    sizes: [
      # For screens smaller than 800px, scale down to 780px width.
      [800, 780]
    ]
    transform: "co_rgb:000000,e_colorize:60"
  )
}
```

and the response you get should contain all the data needed for you to build the
necessary tags for displaying the image.

Apart from the data producer, there is also a directive called _responsiveImage_
which you can use directly in the graphql schema. So the above code could
become:

```graphql
fragment Hero on Page {
  heroImage(
    # Display a 1600/800 header image by default.
    width: 1600
    height: 800
    sizes: [
      # For screens smaller than 800px, scale down to 780px width.
      [800, 780]
    ]
    transform: "co_rgb:000000,e_colorize:60"
  )
    @responsiveImage(
      width: "$width"
      height: "$height"
      sizes: "$sizes"
      transform: "$transform"
    )
}
```

Other parts:

- [Gatsby plugin](../../../npm/@amazeelabs/gatsby-silverback-cloudinary)

## Installation

Drupal:

- `composer require amazeelabs/silverback_cloudinary`
- Make sure you have the CLOUDINARY_URL env variable set as instructed on the
  [Cloudinary dashboard](https://console.cloudinary.com/console) (testing
  credentials:
  CLOUDINARY_URL=cloudinary://219736568324247:PsDMMn1fMdm2lj9TlJMICX25KEA@ddj1ybv54)
- `drush en silverback_cloudinary`

Gatsby:

- `yarn add @amazeelabs/gatsby-silverback-cloudinary`
- Make sure you have the following env variables set: _CLOUDINARY_API_SECRET_,
  _CLOUDINARY_API_KEY_, _CLOUDINARY_CLOUDNAME_
- in gatsby-config.ts , add the plugin like this (**very important**: after the
  _@amazeelabs/gatsby-source-silverback_ plugin)

```javascript
{
  resolve: '@amazeelabs/gatsby-silverback-cloudinary';
}
```
