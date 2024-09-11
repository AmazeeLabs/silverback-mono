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

There is also a `<ImageSettings>` context provider that allows to define some
global settings.

For a detailed list of properties of both, please refer to the type information
in the source code.

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
