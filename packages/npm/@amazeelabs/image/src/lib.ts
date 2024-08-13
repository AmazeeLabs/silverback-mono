import { CSSProperties, DetailedHTMLProps, ImgHTMLAttributes } from 'react';

export type ImageProps = Omit<
  DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
  'srcSet' | 'width' | 'height' | 'loading' | 'decoding' | 'fetchPriority'
> & {
  width: number;
  height?: number;
  focus?: [number, number];
  priority?: boolean;
  breakpoints?: Array<number>;
};

export type ImageSettings = {
  resolutions: Array<number>;
  staticDir: string;
  outputDir: string;
  outputPath: string;
};
export const defaultImageSettings = {
  outputDir: 'dist/public',
  outputPath: '/',
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
