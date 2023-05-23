import { describe, expect, it } from 'vitest';

import { buildResponsiveImage } from './responsive_image';

describe('buildResponsiveImage()', () => {
  const credentials = {
    secret: 'test',
    key: 'test',
    cloudname: 'demo',
  };

  const imageProps = {
    src: 'http://www.example.com/test_image.png',
    width: 1600,
    height: 1200,
  };

  const cloudinaryFetchUrl = 'https://res.cloudinary.com/demo/image/fetch';
  it('asks for the original image', () => {
    const result = JSON.parse(buildResponsiveImage(credentials, imageProps));
    expect(result).toStrictEqual(imageProps);
  });

  it('asks for a width (scale image)', () => {
    const result = JSON.parse(
      buildResponsiveImage(credentials, imageProps, {
        width: 600,
      }),
    );
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--mMcf9g3W--/f_auto/c_scale,w_600/${imageProps.src}`,
      width: 600,
      height: 450,
    });
  });

  it('asks for a width and height', () => {
    const result = JSON.parse(
      buildResponsiveImage(credentials, imageProps, {
        width: 600,
        height: 400,
      }),
    );
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--QmPjqg1S--/f_auto/c_fill,h_400,w_600/${imageProps.src}`,
      width: 600,
      height: 400,
    });
  });

  it('asks for a custom transformation', () => {
    const result = JSON.parse(
      buildResponsiveImage(credentials, imageProps, {
        width: 600,
        height: 400,
        transform: 'c_lfill,h_150,w_150',
      }),
    );
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--qWenXwR1--/f_auto/c_fill,h_400,w_600/c_lfill,h_150,w_150/${imageProps.src}`,
      width: 600,
      height: 400,
    });
  });

  it('asks for sizes', () => {
    const result = JSON.parse(
      buildResponsiveImage(credentials, imageProps, {
        width: 1600,
        sizes: [
          [800, 780],
          [1200, 1100],
        ],
      }),
    );
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--aDf84wZ---/f_auto/c_scale,w_1600/${imageProps.src}`,
      width: 1600,
      height: 1200,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `${cloudinaryFetchUrl}/s--9R_Nlnad--/f_auto/c_scale,w_780/${imageProps.src} 780w`,
        `${cloudinaryFetchUrl}/s--tNMhIIt8--/f_auto/c_scale,w_1100/${imageProps.src} 1100w`,
      ].join(', '),
    });
  });

  it('asks for a complete test, with height calculation and custom transformations', () => {
    const result = JSON.parse(
      buildResponsiveImage(credentials, imageProps, {
        width: 1600,
        height: 1200,
        sizes: [
          [800, 780],
          [1200, 1100],
        ],
        transform: 'co_rgb:000000,e_colorize:90',
      }),
    );
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--HajkvDOl--/f_auto/c_fill,h_1200,w_1600/co_rgb:000000,e_colorize:90/${imageProps.src}`,
      width: 1600,
      height: 1200,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `${cloudinaryFetchUrl}/s--LrbguHed--/f_auto/c_fill,h_585,w_780/co_rgb:000000,e_colorize:90/${imageProps.src} 780w`,
        `${cloudinaryFetchUrl}/s--NrLexxyx--/f_auto/c_fill,h_825,w_1100/co_rgb:000000,e_colorize:90/${imageProps.src} 1100w`,
      ].join(', '),
    });
  });

  it('returns the original image url when cloudname is "local"', () => {
    const result = JSON.parse(
      buildResponsiveImage(
        {
          cloudname: 'local',
          key: '000',
          secret: 'FFF',
        },
        imageProps,
        {
          width: 1600,
          height: 1200,
          sizes: [
            [800, 780],
            [1200, 1100],
          ],
        },
      ),
    );
    expect(result).toStrictEqual({
      src: `${imageProps.src}`,
      width: 1600,
      height: 1200,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `${imageProps.src} 780w`,
        `${imageProps.src} 1100w`,
      ].join(', '),
    });
  });

  it('retrieves a placeholder image when the cloudname is "test"', () => {
    const result = JSON.parse(
      buildResponsiveImage(
        {
          cloudname: 'test',
          key: '000',
          secret: 'FFF',
        },
        imageProps,
        {
          width: 1600,
          height: 1200,
          sizes: [
            [800, 780],
            [1200, 1100],
          ],
        },
      ),
    );
    expect(result).toStrictEqual({
      src: `https://placehold.co/1600x1200/000/FFF`,
      width: 1600,
      height: 1200,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `https://placehold.co/780x585/000/FFF 780w`,
        `https://placehold.co/1100x825/000/FFF 1100w`,
      ].join(', '),
    });
  });

  it('retrieves a placeholder with ratio 4:3 when there is no height', () => {
    const result = JSON.parse(
      buildResponsiveImage(
        {
          cloudname: 'test',
          key: '000',
          secret: 'FFF',
        },
        imageProps,
        {
          width: 1600,
          sizes: [
            [800, 780],
            [1200, 1100],
          ],
        },
      ),
    );
    expect(result).toStrictEqual({
      src: `https://placehold.co/1600x1200/000/FFF`,
      width: 1600,
      height: 1200,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `https://placehold.co/780x585/000/FFF 780w`,
        `https://placehold.co/1100x825/000/FFF 1100w`,
      ].join(', '),
    });
  });
});
