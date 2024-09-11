'use client';
import {
  createContext,
  forwardRef,
  PropsWithChildren,
  useContext,
} from 'react';

import {
  defaultImageSettings,
  type ImageProps,
  type ImageSettings as ImageSettingsType,
} from './lib.js';

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

export const Image = forwardRef(function Image(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { src, focalPoint, priority, ...props }: ImageProps,
  ref,
) {
  const alterSrc = useContext(ImageSettingsContext).alterSrc || ((src) => src);
  return (
    <img
      src={src ? alterSrc(src) : src}
      ref={ref as any}
      {...{ ...props, style: { ...props.style, objectFit: 'cover' } }}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'async' : 'auto'}
      // eslint-disable-next-line react/no-unknown-property
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
});
