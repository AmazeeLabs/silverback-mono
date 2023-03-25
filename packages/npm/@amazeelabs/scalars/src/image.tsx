import React from 'react';

declare const ImageSource: unique symbol;
export type ImageSource = string & {
  _opaque: typeof ImageSource;
};

type ImageSourceStructure = {
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
};

export function Image({
  source,
  priority,
  alt,
  ...props
}: {
  source: ImageSource;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const { srcset, ...imageData } = JSON.parse(source) as ImageSourceStructure;
  return (
    <img
      decoding={priority ? 'sync' : 'async'}
      loading={priority ? 'eager' : 'lazy'}
      srcSet={srcset}
      {...imageData}
      alt={alt}
      {...props}
    />
  );
}
