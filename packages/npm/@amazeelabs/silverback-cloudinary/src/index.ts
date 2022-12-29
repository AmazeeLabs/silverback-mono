//import { cloudinary } from 'cloudinary';

import { Cloudinary, Transformation } from '@cloudinary/url-gen';
import { fill, scale } from '@cloudinary/url-gen/actions/resize';

type ResponsiveImageConfig = {
  width: number;
  height?: number;
  sizes?: Array<Array<number>>;
  transform?: string;
  variants?: Array<ResponsiveImageVariant>;
}

type ResponsiveImageVariant = {
  media: string;
  width: number;
  height?: number;
  sizes?: Array<Array<number>>;
  transform?: string;
}

type ResponsiveImage = {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
  sources?: Array<ResponsiveImageSource>
}

type ResponsiveImageSource = {
  media: string;
  width: number;
  height?: number;
  srcset: string;
  sizes?: string;
}

export const resolveResponsiveImage = (
  originalImage: string, config?: ResponsiveImageConfig
): ResponsiveImage => {
  const responsiveImage: ResponsiveImage = {
    src: originalImage
  };

  // If no config object is given, we just return the original image url.
  if (typeof config === 'undefined') {
    return responsiveImage;
  }
  const width = config.width;
  const height = config.height || undefined;
  const transform = config.transform || undefined;
  // The image width and height in the response should be the same as the ones
  // sent as parameters.
  // @todo: Unless the width sent is bigger that the width of the original
  // image, since we should not scale up. TBD what to do in this case.
  responsiveImage.width = width;
  responsiveImage.height = height;
  if (typeof config.sizes !== 'undefined') {
    responsiveImage.sizes = buildSizesString(config.sizes, width);
    responsiveImage.srcset = buildSrcSetString(originalImage, config.sizes, {width: width, height: height}, transform);
  }
  responsiveImage.src = getCloudinaryImageUrl(originalImage, {width: width, height: height, transform: transform});

  if (typeof config.variants !== 'undefined') {
    const sources: Array<ResponsiveImageSource> = [];
    config.variants.map((variant) => {
      const variantWidth = variant.width;
      const variantHeight = variant.height || undefined;
      const variantTransform = variant.transform || undefined;

      const source: ResponsiveImageSource  = {
        media: variant.media,
        width: variantWidth,
        height: variantHeight,
        srcset: '',
      };
      if (typeof variant.sizes !== 'undefined') {
        source.sizes = buildSizesString(variant.sizes, variantWidth);
        source.srcset = buildSrcSetString(originalImage, variant.sizes, {width: variantWidth, height: variantHeight}, variantTransform);
      } else {
        source.srcset = getCloudinaryImageUrl(originalImage, {width: variantWidth, height: variantHeight, transform: variantTransform})
      }
      sources.push(source);
    });
    responsiveImage.sources = sources;
  }

  return responsiveImage;
}

/**
 * Builds a sizes string from a sizes array.
 *
 * @param Array sizes
 *  An array of image sizes.
 *  Example: [
 *    [400, 390] -> up until 400px screen width, use the 390px image
 *    [800, 780] -> up until 800px screen width, use the 780px image
 *  ]
 * @param number defaultWitdth
 *  The default width to add at the end of the sizes string.
 *
 * @return string
 */
const buildSizesString = (
  sizes: Array<Array<number>>,
  defaultWitdth?: number
): string => {
  if (sizes.length === 0) {
    return '';
  }

  const sizeEntries: Array<string> = sizes.reduce(
    (accumulator: Array<string>, currentValue: Array<number>) => {
      // Each size must have exactly 2 elements.
      if (currentValue.length !== 2) {
        return accumulator;
      }
      accumulator.push(`(max-width: ${currentValue[0]}px) ${currentValue[1]}px`);
      return accumulator;
    },
    []
  )

  // At the end, add the default width.
  if (typeof defaultWitdth !== 'undefined') {
    sizeEntries.push(`${defaultWitdth}px`);
  }
  return sizeEntries.join(', ');
}

/**
 * Builds a srcset string for an original image, based on a sizes array.
 *
 * @param string originalImage
 *  The original image url
 * @param array sizes
 *  A sizes array, same is in buildSizesString().
 * @param array defaultDimensions
 *  The default dimensions (width and, optionally, height) of the image so
 *  that we can compute the height of each of the image in the src set, by
 *  preserving the aspect ratio.
 * @param string transform
 *  A string that can be any other cloudinary transformation to be added to
 *  each of the resulted images in the src set.
 *
 * @return string
 */
const buildSrcSetString = (
  originalImage: string,
  sizes: Array<Array<number>>,
  defaultDimensions?: {width?: number, height?: number},
  transform?: string
): string => {
  if (sizes.length === 0) {
    return '';
  }

  const srcSetEntries: Array<string> = sizes.reduce(
    (accumulator: Array<string>, currentValue) => {
      // Each size must have exactly 2 elements.
      if (currentValue.length !== 2) {
        return accumulator;
      }
      const imageConfig: {
        width: number,
        height?: number,
        transform?: string
      } = {
        width: currentValue[1],
        transform: transform,
      };
      // If we know the default dimensions of the image, and the width of the
      // desired one, we can also calculate the height of it, assuming we keep
      // the aspect ratio.
      if (typeof defaultDimensions?.width !== 'undefined' && typeof defaultDimensions?.height !== 'undefined') {
        imageConfig.height = defaultDimensions.width > 0 ? Math.round(imageConfig.width * defaultDimensions.height / defaultDimensions.width) : 0;
      }
      accumulator.push(`${getCloudinaryImageUrl(originalImage, imageConfig)} ${imageConfig.width}w`);
      return accumulator;
    },
    []
  )

  return srcSetEntries.join(', ');
}

const getCloudinaryImageUrl = (
  originalImage: string,
  config?: {width?: number, height?: number, transform?: string}
): string => {
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'ddj1ybv54',
      apiKey: '219736568324247',
      apiSecret: 'PsDMMn1fMdm2lj9TlJMICX25KEA'
    },
  });
  const image = cld.image(originalImage);
  image.setDeliveryType('fetch');
  image.sign();
  image.format('auto');
  if (typeof config?.width !== 'undefined' || typeof config?.height !== 'undefined') {
    // If both, width and height, are provided, then we resize the image.
    if (typeof config?.width !== 'undefined' && typeof config?.height !== 'undefined') {
      image.resize(fill(config.width, config.height));
    } else {
      image.resize(scale(config.width, config.height));
    }
  }
  if (typeof config?.transform !== 'undefined') {
    const tranformation = new Transformation();
    tranformation.addTransformation(config.transform);
    image.transformation = tranformation;
  };

  return image.toURL();
}
