import { CSSProperties, DetailedHTMLProps, ImgHTMLAttributes } from 'react';

export type ImageProps = Omit<
  DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
  'srcSet' | 'width' | 'height' | 'loading' | 'decoding' | 'fetchPriority'
> & {
  /**
   * The URL of the image to display. This can be a URL, an absolute or relative file path.
   */
  src?: string | undefined;
  /**
   * The largest width in pixels this image is going to be displayed at.
   * In most cases this should be the "desktop" display width.
   *
   * This will be the largest image generated. For full-screen header images,
   * a maximum width has to be defined still, since there are weird screens
   * out there.
   */
  width: number;
  /**
   * A fixed height for the image in pixels. If provided, the image will be
   * cropped to meet the defined aspect ratio.
   *
   * As with "width", this should be the largest displayed height, which is
   * usually the "desktop" display height.
   */
  height?: number;
  /**
   * A pair of coordinates to define the focus point of the image. The first
   * one is the x-coordinate, the second one is the y-coordinate. Both are
   * relative to the top-left corner of the *original* image.
   */
  focalPoint?: Array<number>;
  /**
   * A single property to switch between important and lazy-loaded images.
   * It controls the `loading` and `decoding` attributes.
   * Images are lazy by default. Only for "above the fold" images (hero, headers...),
   * "priority" should be set to `true`.
   */
  priority?: boolean;
};

export type ImageSettings = {
  /**
   * A list of common device widths to optimize for. Defaults to a sensible list,
   * but can be overridden if necessary.
   */
  resolutions: Array<number>;
  /**
   * The directory to prepend if a relative file path is provided to `src`.
   * The main use case are images stored in Storybook's `static` directory,
   * that are shared with the production build.
   */
  staticDir: string;
  /**
   * The directory to write optimized images to.
   */
  outputDir: string;
  /**
   * The frontend path where optimized images are served from. Has to route to
   * `outputDir`.
   */
  outputPath: string;
  /**
   * Alter the `src` attribute before it is processed. This can be useful if
   * images are rendered on the client side and the host has to be adjusted.
   */
  alterSrc?: (src: string) => string;
};

export const defaultImageSettings = {
  outputDir: 'dist/public',
  outputPath: '',
  staticDir: 'public',
  resolutions: [
    6016, // 6K
    5120, // 5K
    4480, // 4.5K
    3840, // 4K
    3200, // QHD+
    2560, // WQXGA
    2048, // QXGA
    1920, // 1080p
    1668, // Various iPads
    1280, // 720p
    1080, // iPhone 6-8 Plus
    960, // older horizontal phones
    828, // iPhone XR/11
    750, // iPhone 6-8
    640, // older and lower-end phones
  ],
} satisfies ImageSettings;

export type Dimensions = {
  width: number;
  height: number;
};

export function inferTargetDimensions(
  source: Dimensions,
  width: number,
  height: number | undefined,
): Dimensions {
  if (height && width) {
    return { height, width };
  } else {
    return {
      width,
      height: Math.round((source.height / source.width) * width),
    };
  }
}

export type Focus = [number, number];

export function validateFocus(
  focus: Array<number> | undefined,
): Focus | undefined {
  if (!focus || focus.length === 2) {
    return focus as Focus;
  }
  console.warn('Invalid focus point:', focus);
}

export function calculateFocusExtraction(
  source: readonly [number, number],
  target: readonly [number, number],
  focus: readonly [number, number] = [source[0] / 2, source[1] / 2],
): {
  top: number;
  left: number;
  width: number;
  height: number;
} {
  const sourceRatio = source[0] / source[1];
  const targetRatio = target[0] / target[1];
  if (sourceRatio === targetRatio) {
    return { top: 0, left: 0, width: source[0], height: source[1] };
  } else if (sourceRatio > targetRatio) {
    // Portrait cuts:
    const width = (source[1] / target[1]) * target[0];
    const height = source[1];
    const top = 0;
    const left = Math.min(Math.max(0, focus[0] - width / 2), source[0] - width);
    return {
      width: Math.round(width),
      height: Math.round(height),
      top: Math.round(top),
      left: Math.round(left),
    };
  } else {
    // Landscape cuts:
    const width = source[0];
    const height = (source[0] / target[0]) * target[1];
    const left = 0;
    const top = Math.min(
      Math.max(0, focus[1] - height / 2),
      source[1] - height,
    );
    return {
      width: Math.round(width),
      height: Math.round(height),
      top: Math.round(top),
      left: Math.round(left),
    };
  }
}

const position = [
  'top left',
  'top center',
  'top right',
  'center left',
  'center center',
  'center right',
  'bottom left',
  'bottom center',
  'bottom right',
] satisfies Array<CSSProperties['backgroundPosition']>;

export function calculateFocusPosition(
  width: number,
  height: number,
  focus: Focus,
) {
  const index = focus
    ? Math.floor((focus[0] * 3) / width) +
      Math.floor((focus[1] * 3) / height) * 3
    : 4;
  return position[index];
}
