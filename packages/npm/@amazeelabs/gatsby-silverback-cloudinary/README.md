# Gatsby Silverback Cloudinary

Gatsby plugin that extends the GraphQL schema with a field (and a resolver) that
can load (responsive) images from the [Cloudinary](https://cloudinary.com/)
service.

The field resolver will use the original source value of the field and a config
object (see bellow) to build the Cloudinary image urls.

## Installation & Configuration

Simply install the package, add to your Gatsby configuration, and make sure you
have defined the following env variables that you can get from the
[Cloudinary dashboard](https://console.cloudinary.com/console):

- _CLOUDINARY_API_SECRET_
- _CLOUDINARY_API_KEY_
- _CLOUDINARY_CLOUDNAME_

```shell
yarn add @amazeelabs/gatsby-silverback-cloudinary
```

```typescript
export const plugins = {
  resolve: '@amazeelabs/gatsby-silverback-cloudinary',
};
```

**Very important**: the plugin must be added after the
_@amazeelabs/gatsby-source-silverback_, or any other source plugin that can add
a _DrupalResponsiveImage_ field.

Now you can do queries like:

```graphql
fragment Hero on Page {
  heroImage(
    config: {
      # Display a 1600/800 header image by default.
      width: 1600
      height: 800
      sizes: [
        # For screens smaller than 800px, scale down to 780px width.
        [800, 780]
      ]
      variants: [
        {
          # Use this variant for small portrait displays like phones.
          media: "(max-width: 800px) and (orientation: portrait)"
          # Request a portrait cut instead of landscape.
          width: 800
          height: 1600
          # On mobile, text overlays the image, so we tint it a bit.
          # https://cloudinary.com/documentation/transformation_reference
          transform: "co_rgb:000000,e_colorize:60"
        }
      ]
    }
  )
}
```

The response will be on this type (_DrupalResponsiveImage_):

```typescript
{
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
  sources: Array<{
    media: string;
    src: string;
    srcset: string;
    width: number;
    height: number;
  }>;
}
```
