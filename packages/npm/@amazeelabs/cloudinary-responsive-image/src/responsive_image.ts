import { CloudinaryImage, Transformation } from '@cloudinary/url-gen';
import { fill, scale } from '@cloudinary/url-gen/actions/resize';
import CryptoJS from 'crypto-js';
import sha1 from 'crypto-js/sha1';

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

type CloudinaryCredentials = {
  secret: string;
  key: string;
  cloudname: string;
};

export const buildResponsiveImage = (
  credentials: CloudinaryCredentials,
  originalImage: string,
  config?: ResponsiveImageConfig,
): string => {
  const responsiveImage: ResponsiveImage = {
    src: originalImage,
  };

  // If no config object is given, we just return the original image url.
  if (typeof config === 'undefined') {
    return JSON.stringify(responsiveImage);
  }

  const width = config.width;
  const height = config.height || undefined;
  const transform = config.transform || undefined;
  // The image width and height in the response should be the same as the ones
  // sent as parameters.
  // @todo: Unless the width sent is bigger that the width of the original
  // image, since we should not scale up. TBD what to do in this case.
  responsiveImage.width = width;
  if (height) {
    responsiveImage.height = height;
  }
  if (typeof config.sizes !== 'undefined') {
    responsiveImage.sizes = buildSizesString(config.sizes, width);
    responsiveImage.srcset = buildSrcSetString(
      credentials,
      originalImage,
      config.sizes,
      { width: width, height: height },
      transform,
    );
  }
  responsiveImage.src = getCloudinaryImageUrl(credentials, originalImage, {
    width: width,
    height: height,
    transform: transform,
  });

  return JSON.stringify(responsiveImage);
};

/**
 * Builds a sizes string from a sizes array.
 *
 * @param sizes
 *  An array of image sizes.
 *  Example: [
 *    [400, 390] -> up until 400px screen width, use the 390px image
 *    [800, 780] -> up until 800px screen width, use the 780px image
 *  ]
 * @param defaultWidth
 *  The default width to add at the end of the sizes string.
 *
 * @return string
 */
const buildSizesString = (
  sizes: Array<Array<number>>,
  defaultWidth?: number,
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
      accumulator.push(
        `(max-width: ${currentValue[0]}px) ${currentValue[1]}px`,
      );
      return accumulator;
    },
    [],
  );

  // At the end, add the default width.
  if (typeof defaultWidth !== 'undefined') {
    sizeEntries.push(`${defaultWidth}px`);
  }
  return sizeEntries.join(', ');
};

/**
 * Builds a srcset string for an original image, based on a sizes array.
 *
 * @param originalImage
 *  The original image url
 * @param sizes
 *  A sizes array, same is in buildSizesString().
 * @param defaultDimensions
 *  The default dimensions (width and, optionally, height) of the image so
 *  that we can compute the height of each of the image in the src set, by
 *  preserving the aspect ratio.
 * @param transform
 *  A string that can be any other cloudinary transformation to be added to
 *  each of the resulted images in the src set.
 *
 * @return string
 */
const buildSrcSetString = (
  credentials: CloudinaryCredentials,
  originalImage: string,
  sizes: Array<Array<number>>,
  defaultDimensions?: { width?: number; height?: number },
  transform?: string,
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
        width: number;
        height?: number;
        transform?: string;
      } = {
        width: currentValue[1],
        transform: transform,
      };
      // If we know the default dimensions of the image, and the width of the
      // desired one, we can also calculate the height of it, assuming we keep
      // the aspect ratio.
      if (
        typeof defaultDimensions?.width !== 'undefined' &&
        typeof defaultDimensions?.height !== 'undefined'
      ) {
        imageConfig.height =
          defaultDimensions.width > 0
            ? Math.round(
                (imageConfig.width * defaultDimensions.height) /
                  defaultDimensions.width,
              )
            : 0;
      }
      accumulator.push(
        `${getCloudinaryImageUrl(credentials, originalImage, imageConfig)} ${
          imageConfig.width
        }w`,
      );
      return accumulator;
    },
    [],
  );

  return srcSetEntries.join(', ');
};

const getCloudinaryImageUrl = (
  credentials: CloudinaryCredentials,
  originalImage: string,
  config?: { width?: number; height?: number; transform?: string },
): string => {
  const cloudName = credentials.cloudname;
  const apiKey = credentials.key;
  const apiSecret = credentials.secret;
  if (cloudName === 'test') {
    return `https://placehold.co/${config?.width}x${
      config?.height || (config?.width || 1000) * 0.75
    }/${apiKey}/${apiSecret}`;
  }
  const image = new CloudinaryImage(
    originalImage,
    {
      cloudName: cloudName,
      apiKey: apiKey,
      apiSecret: apiSecret,
    },
    {
      analytics: false,
      // Even though we have this parameter available, it has no effect. We keep
      // it here for future references, maybe in future releases the sign url
      // feature will be implemented. Until then, we sign the delivery URL
      // ourselves, using the instructions from
      // https://cloudinary.com/documentation/advanced_url_delivery_options#generating_delivery_url_signatures
      //signUrl: true
    },
  );
  image.setDeliveryType('fetch');
  image.format('auto');
  if (
    typeof config?.width !== 'undefined' ||
    typeof config?.height !== 'undefined'
  ) {
    // If both, width and height, are provided, then we resize the image.
    if (
      typeof config?.width !== 'undefined' &&
      typeof config?.height !== 'undefined'
    ) {
      image.resize(fill(config.width, config.height));
    } else {
      image.resize(scale(config.width, config.height));
    }
  }
  if (typeof config?.transform !== 'undefined') {
    const tranformation = new Transformation();
    tranformation.addTransformation(config.transform);
    image.addTransformation(tranformation);
  }

  // There is no utility right now to sign a delivery image (even though there
  // is a sign() method on the CloudinaryImage class, which does... nothing; it
  // just returns the current object), so we do it here using the instructions
  // from https://cloudinary.com/documentation/advanced_url_delivery_options#generating_delivery_url_signatures
  const toSign = [image.transformation.toString(), originalImage].join('/');
  const digest = sha1(`${toSign}${apiSecret}`).toString(CryptoJS.enc.Base64url);
  image.setSignature(digest.substring(0, 8));

  return image.toURL();
};
