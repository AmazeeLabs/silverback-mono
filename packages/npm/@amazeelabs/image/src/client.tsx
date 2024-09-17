'use client';
import {
  createContext,
  forwardRef,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  calculateFocusPosition,
  defaultImageSettings,
  type ImageProps,
  type ImageSettings as ImageSettingsType,
  inferTargetDimensions,
  validateFocus,
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

function sizerImage(width: number, height: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"></svg>`;
  return `data:image/svg+xml;base64,${base64(svg)}`;
}

export const Image = forwardRef(function Image(
  { src, focalPoint, ...props }: ImageProps,
  forwardRef,
) {
  const alterSrc = useContext(ImageSettingsContext).alterSrc;
  const alteredSrc = alterSrc && src ? alterSrc(src) : src;
  const localRef = useRef<HTMLImageElement | null>(null);
  const ref = (forwardRef || localRef) as typeof localRef;
  const [dimensions, setDimensions] = useState<
    { width: number; height: number } | undefined
  >();
  useEffect(() => {
    if (!dimensions && ref.current) {
      if (ref.current.naturalWidth && ref.current.naturalHeight) {
        setDimensions({
          width: ref.current.naturalWidth,
          height: ref.current.naturalHeight,
        });
      } else {
        const interval = setInterval(() => {
          if (
            ref.current &&
            ref.current.naturalWidth &&
            ref.current.naturalHeight
          ) {
            setDimensions({
              width: ref.current.naturalWidth,
              height: ref.current.naturalHeight,
            });
          }
        }, 200);
        return () => window.clearInterval(interval);
      }
    }
  }, [dimensions, setDimensions, ref]);

  useEffect(() => {
    if (ref.current && alteredSrc && dimensions) {
      const target = inferTargetDimensions(
        dimensions,
        props.width,
        props.height,
      );
      ref.current.style.backgroundImage = `url(${alteredSrc})`;
      ref.current.style.backgroundSize = 'cover';
      ref.current.style.maxWidth = '100%';

      ref.current.style.backgroundPosition = calculateFocusPosition(
        ref.current.naturalWidth,
        ref.current.naturalHeight,
        validateFocus(focalPoint) || [
          ref.current.naturalWidth / 2,
          ref.current.naturalHeight / 2,
        ],
      );
      ref.current.src = sizerImage(target.width, target.height);
      return;
    }
  }, [
    dimensions,
    ref,
    focalPoint,
    props.width,
    props.height,
    alteredSrc,
    alterSrc,
  ]);
  return <img src={alteredSrc} ref={ref} {...props} />;
});
