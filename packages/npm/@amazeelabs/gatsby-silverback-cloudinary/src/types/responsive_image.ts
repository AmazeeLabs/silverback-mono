export type ResponsiveImageConfig = {
  width: number;
  height?: number;
  sizes?: Array<Array<number>>;
  transform?: string;
  variants?: Array<ResponsiveImageVariant>;
}

export type ResponsiveImageVariant = {
  media: string;
  width: number;
  height?: number;
  sizes?: Array<Array<number>>;
  transform?: string;
}

export type ResponsiveImage = {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
  sources?: Array<ResponsiveImageSource>
}

export type ResponsiveImageSource = {
  media: string;
  width: number;
  height?: number;
  srcset: string;
  sizes?: string;
}