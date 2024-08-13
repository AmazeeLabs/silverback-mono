'use client';
import { imageDimensionsFromStream } from 'image-dimensions';
import {
  createContext,
  forwardRef,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

import {
  calculateFocusPosition,
  defaultImageSettings,
  type ImageProps,
  type ImageSettings as ImageSettingsType,
  inferTargetDimensions,
} from './lib.js';

function base64(content: string) {
  if (typeof btoa === 'undefined') {
    return Buffer.from(content, 'base64').toString('binary');
  }
  return btoa(content);
}

const ImageSettingsContext =
  createContext<ImageSettingsType>(defaultImageSettings);

export function ImageSettings({
  children,
  ...settings
}: PropsWithChildren<Partial<ImageSettingsType>>) {
  return (
    <ImageSettingsContext.Provider
      value={{ ...defaultImageSettings, ...settings }}
    >
      {children}
    </ImageSettingsContext.Provider>
  );
}

async function imageDimensions(src: string) {
  const response = await fetch(src);
  if (!response.body) {
    throw new Error('Failed to fetch image');
  }
  return imageDimensionsFromStream(response.body);
}

function sizerImage(width: number, height: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"></svg>`;
  return `data:image/svg+xml;base64,${base64(svg)}`;
}

export const Image = forwardRef(function Image(
  { focus, ...props }: ImageProps,
  ref,
) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const r = imageRef || ref;
    if (r.current && props.src) {
      imageDimensions(props.src)
        .then((source) => {
          if (!r.current || !source) {
            return;
          }
          const target = inferTargetDimensions(
            source,
            props.width,
            props.height,
          );
          r.current.style.backgroundImage = `url(${props.src})`;
          r.current.style.backgroundSize = 'cover';
          r.current.style.maxWidth = '100%';

          if (focus) {
            r.current.style.backgroundPosition = calculateFocusPosition(
              r.current.naturalWidth,
              r.current.naturalHeight,
              focus,
            );
          }
          r.current.src = sizerImage(target.width, target.height);
          return;
        })
        .catch((error) => console.error(error));
    }
  }, [imageRef, ref, focus, props.width, props.height, props.src]);
  return <img ref={imageRef || ref} {...props} />;
});
