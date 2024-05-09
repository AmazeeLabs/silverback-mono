import { buildResponsiveImage } from '@amazeelabs/cloudinary-responsive-image';

import { ResponsiveImageConfig } from '../types/responsive_image';

export const resolveResponsiveImage = (
  originalImage: string,
  config?: ResponsiveImageConfig,
): string => {
  const responsiveImage = JSON.parse(originalImage);

  // If no config object is given, we just return the original image url.
  if (typeof config === 'undefined') {
    return JSON.stringify(responsiveImage);
  }

  // Also, if the cloudinary env variables are not set, just return the original
  // image.
  if (
    typeof process.env.CLOUDINARY_API_SECRET === 'undefined' ||
    typeof process.env.CLOUDINARY_API_KEY === 'undefined' ||
    typeof process.env.CLOUDINARY_CLOUDNAME === 'undefined'
  ) {
    return JSON.stringify(responsiveImage);
  }
  return buildResponsiveImage(
    {
      secret: process.env.CLOUDINARY_API_SECRET,
      key: process.env.CLOUDINARY_API_KEY,
      cloudname: process.env.CLOUDINARY_CLOUDNAME,
    },
    {
      ...responsiveImage,
      // Make sure to not send an already URI encoded string as the image src,
      // otherwise we endup having double encoded src values, because the
      // cloudinary SDK also encodes the URI.
      src: decodeURIComponent(responsiveImage.src || ''),
    },
    config,
  );
};
