import type { SilverbackResolver } from '@amazeelabs/gatsby-source-silverback';

import { resolveResponsiveImage } from './resolvers/responsive_image';

export * from './resolvers/responsive_image';

export const responsiveImage: SilverbackResolver = (source: any, args: any) => {
  return resolveResponsiveImage(source, {
    width: args.width,
    height: args.height,
    sizes: args.sizes,
    transform: args.transform,
  });
};
