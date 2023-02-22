import { describe, expect, it } from 'vitest';

import {resolveResponsiveImage} from "../index";

describe('resolveResponsiveImage()', () => {
  process.env.CLOUDINARY_API_SECRET = 'test';
  process.env.CLOUDINARY_API_KEY = 'test';
  process.env.CLOUDINARY_CLOUDNAME = 'demo';
  const imageUrl = 'http://www.example.com/test_image.png';
  const cloudinaryFetchUrl = 'https://res.cloudinary.com/demo/image/fetch';
  it('asks for the original image', () => {
    const result = JSON.parse(resolveResponsiveImage(imageUrl));
    expect(result).toStrictEqual({
      src: imageUrl,
    });
  });

  it('asks for a width (scale image)', () => {
    const result = JSON.parse(resolveResponsiveImage(imageUrl, {
      width: 600
    }));
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--mMcf9g3W--/f_auto/c_scale,w_600/${imageUrl}`,
      width: 600,
    });
  });

  it ('asks for a width and height', () => {
    const result = JSON.parse(resolveResponsiveImage(imageUrl, {
      width: 600,
      height: 400,
    }));
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--QmPjqg1S--/f_auto/c_fill,h_400,w_600/${imageUrl}`,
      width: 600,
      height: 400,
    });
  });

  it('asks for a custom transformation', () => {
    const result = JSON.parse(resolveResponsiveImage(imageUrl, {
      width: 600,
      height: 400,
      transform: 'c_lfill,h_150,w_150',
    }));
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--qWenXwR1--/f_auto/c_fill,h_400,w_600/c_lfill,h_150,w_150/${imageUrl}`,
      width: 600,
      height: 400,
    });
  });

  it('asks for sizes', () => {
    const result = JSON.parse(resolveResponsiveImage(imageUrl, {
      width: 1600,
      sizes: [
        [800, 780],
        [1200, 1100],
      ]
    }));
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--aDf84wZ---/f_auto/c_scale,w_1600/${imageUrl}`,
      width: 1600,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `${cloudinaryFetchUrl}/s--9R_Nlnad--/f_auto/c_scale,w_780/${imageUrl} 780w`,
        `${cloudinaryFetchUrl}/s--tNMhIIt8--/f_auto/c_scale,w_1100/${imageUrl} 1100w`,
      ].join(', '),
    });
  });

  it('asks for a complete test, with height calculation and custom transformations', () => {
    const result = JSON.parse(resolveResponsiveImage(imageUrl, {
      width: 1600,
      height: 1200,
      sizes: [
        [800, 780],
        [1200, 1100],
      ],
      transform: 'co_rgb:000000,e_colorize:90',
    }));
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--HajkvDOl--/f_auto/c_fill,h_1200,w_1600/co_rgb:000000,e_colorize:90/${imageUrl}`,
      width: 1600,
      height: 1200,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `${cloudinaryFetchUrl}/s--LrbguHed--/f_auto/c_fill,h_585,w_780/co_rgb:000000,e_colorize:90/${imageUrl} 780w`,
        `${cloudinaryFetchUrl}/s--NrLexxyx--/f_auto/c_fill,h_825,w_1100/co_rgb:000000,e_colorize:90/${imageUrl} 1100w`,
      ].join(', '),
    });
  });
});
