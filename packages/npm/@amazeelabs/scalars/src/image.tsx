import React from 'react';

declare const ImageSource: unique symbol;
export type ImageSource = string & {
  _opaque: typeof ImageSource;
};

export function Image({
  source,
  priority,
  alt,
  width,
  height,
  ...props
}: {
  width: number;
  height: number;
  source: ImageSource;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const imageData = JSON.parse(source);
  return (
    <img
      decoding={priority ? 'sync' : 'async'}
      loading={priority ? 'eager' : 'lazy'}
      width={width > 0 ? width : undefined}
      height={height > 0 ? height : undefined}
      {...imageData}
      alt={alt}
      {...props}
    />
  );
}
