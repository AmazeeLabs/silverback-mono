export type ResponsiveImageConfig = {
  width: number;
  height?: number;
  sizes?: Array<Array<number>>;
  transform?: string;
};

export type ResponsiveImage = {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
};
