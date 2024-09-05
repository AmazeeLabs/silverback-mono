# RSC Image handling

React component for scaling and cropping images. Very simple, opinionated
interface, that resembles the standard HTML `<img>` tag and produces performant
responsive images.

```tsx
import { Image } from '@amazeelabs/image';

export function MyComponent() {
  return (
    <Image
      src="https://example.com/image.jpg"
      alt="An image"
      width={400}
      height={300}
      focus={[140, 110]}
    />
  );
}
```

## Properties

- `src`: The URL of the image to display. Can be either a real url (starting
  with `http://` or `https://`), a relative path or the path of a file in the
  "static" folder (starting with `/`) of the respective framework.
- `width`: Required. The largest displayed width. Has to be a `number`.
- `height`: Optional. The corresponding height. If provided, the image will be
  cropped, otherwise it will just be scaled.
- `focus`: Optional. The focus point of the image. The image will be cropped
  around this point. The value is an array with two numbers, the first one
  representing the x-coordinate and the second one the y-coordinate based on the
  original image size.
- `priority`: Optional boolean value. If set to `true`, the image will be
  eagerly loaded and should be used for critical images above the fold. All
  other images are lazyily loaded by default.

## Settings

There is an optional `<ImageSettings>` context provider that allows to define a
`alterSrc` function to adjust image urls before they are rendered. That might be
used by frameworks to adjust images urls based on the environment.

## Opinions

The following opinions are built into the component and allow for a very simple
implementation, that does not require more complex markup, like the `<picture>`
tag.

- Produces only JPG images. WebP are considered a performance optimization that
  can be implemented by an image CDN. When pre-generating images on disk, this
  would result in too many files.
- Art-direction is done using multiple images that are shown/hidden using
  multiple images and Tailwind utility classes, which are not supported by
  `<picture>` and `<source>` tags.
- There is no need to define sizes and sourcesets, since there are too many
  screen variations. The component will create a sensible set of images based on
  the provided width and height.

## Client side rendering

The component also has a client-side rendering mode, that can be used to display
the component in Storybook, or even rare even client side rendering cases. It
will simulate cropping based on the focus point, but it will not actually
optimize images. The original source will always be downloaded.
