# Silverback Cloudinary

This module provides a graphql extension that can be used to load (responsive) images using the [Cloudinary](https://cloudinary.com/) service.

The graphql extension consist of a _ResponsiveImage_ type and the fields of this type can have a _ResponsiveImageConfig_ parameter, for example:

```graphql
type Page {
  responsiveImage(config: ResponsiveImageConfig): ResponsiveImage
}
```

Then you can query data like this:
```graphql
fragment Hero on Page {
  heroImage(config: {
    # Display a 1600/800 header image by default.
    width: 1600,
    height: 800,
    sizes: [
      # For screens smaller than 800px, scale down to 780px width.
      [800, 780]
    ],
    variants: [
      {
        # Use this variant for small portrait displays like phones.
        media: "(max-width: 800px) and (orientation: portrait)",
        # Request a portrait cut instead of landscape.
        width: 800,
        height: 1600,
        # On mobile, text overlays the image, so we tint it a bit.
        # https://cloudinary.com/documentation/transformation_reference
        transform: "co_rgb:000000,e_colorize:60"
      }
    ]
  })
}
```
and the response you get (of type _ResponsiveImage_ ) should contain all the data needed for you to build the necessary tags for displaying the image.

The module also implements a data producer that is able to take a string (the original image path, which needs to be publicly available) and the config parameter, and will return an object that maps over the _ResponsiveImage_ type. You can use the data producer like that:
```php
  addResolver('Page.heroImage',
    $builder->compose(
      // ...any other calls to data producers or callbacks that will return a string (image url), for example:
      //$builder->callback(function ($value) {
      //  return '';
      //}),
      $builder->produce('responsive_image')
        ->map('image', $builder->fromParent())
        ->map('config', $builder->fromArgument('config')
      )
    )
  );
```

When no config is supplied, the returned data will just consist of the original image url, in the _src_ field.

Other parts:

- [Gatsby plugin](../../../npm/@amazeelabs/gatsby-silverback-cloudinary)

## Installation

Drupal:

- `composer require amazeelabs/silverback_cloudinary`
- Make sure you have the CLOUDINARY_URL env variable set as instructed on the [Cloudinary dashboard](https://console.cloudinary.com/console) (testing credentials: CLOUDINARY_URL=cloudinary://219736568324247:PsDMMn1fMdm2lj9TlJMICX25KEA@ddj1ybv54)
- `drush en silverback_cloudinary`
- Enable the schema extension on each of the graphql servers: /admin/config/graphql (by editing each of the server)

Gatsby:
- `yarn add @amazeelabs/gatsby-silverback-cloudinary`
- Make sure you have the following env variables set: _CLOUDINARY_API_SECRET_, _CLOUDINARY_API_KEY_, _CLOUDINARY_CLOUDNAME_
- in gatsby-config.ts , add the plugin like this (**very important**: after the _@amazeelabs/gatsby-source-silverback_ plugin)
```javascript
{
  resolve: '@amazeelabs/gatsby-silverback-cloudinary'
}
```
