'use client';
import {
  createContext,
  forwardRef,
  PropsWithChildren,
  useContext,
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
  console.log('settings', settings.alterSrc);
  return (
    <ImageSettingsContext.Provider
      value={{ ...defaultImageSettings, ...settings }}
    >
      {children}
    </ImageSettingsContext.Provider>
  );
}

function sizerImage(width: number, height: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"></svg>`;
  return `data:image/svg+xml;base64,${base64(svg)}`;
}

export const Image = forwardRef(function Image(
  { src, focalPoint, ...props }: ImageProps,
  ref,
) {
  const alterSrc = useContext(ImageSettingsContext).alterSrc;
  const alteredSrc = alterSrc && src ? alterSrc(src) : src;
  const imageRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const r = imageRef || ref;
    if (r.current && alteredSrc) {
      const source = {
        width: r.current.naturalWidth,
        height: r.current.naturalHeight,
      };
      if (!r.current || !source) {
        return;
      }
      const target = inferTargetDimensions(source, props.width, props.height);
      r.current.style.backgroundImage = `url(${alteredSrc})`;
      r.current.style.backgroundSize = 'cover';
      r.current.style.maxWidth = '100%';

      r.current.style.backgroundPosition = calculateFocusPosition(
        r.current.naturalWidth,
        r.current.naturalHeight,
        focalPoint || [r.current.naturalWidth / 2, r.current.naturalHeight / 2],
      );
      r.current.src = sizerImage(target.width, target.height);
      return;
    }
  }, [
    imageRef,
    ref,
    focalPoint,
    props.width,
    props.height,
    alteredSrc,
    alterSrc,
  ]);
  return <img src={alteredSrc} ref={imageRef || ref} {...props} />;
});
