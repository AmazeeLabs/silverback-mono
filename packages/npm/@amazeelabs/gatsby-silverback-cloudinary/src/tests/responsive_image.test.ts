import {resolveResponsiveImage} from "../index";

describe('resolveResponsiveImage()', () => {
  process.env.CLOUDINARY_API_SECRET = 'test';
  process.env.CLOUDINARY_API_KEY = 'test';
  process.env.CLOUDINARY_CLOUDNAME = 'demo';
  const imageUrl = 'http://www.example.com/test_image.png';
  const cloudinaryFetchUrl = 'https://res.cloudinary.com/demo/image/fetch';
  it('asks for the original image', () => {
    const result = resolveResponsiveImage(imageUrl);
    expect(result).toStrictEqual({
      src: imageUrl,
    });
  });

  it('asks for a width (scale image)', () => {
    const result = resolveResponsiveImage(imageUrl, {
      width: 600,
    });
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--mMcf9g3W--/f_auto/c_scale,w_600/${imageUrl}`,
      width: 600,
    });
  });

  it ('asks for a width and height', () => {
    const result = resolveResponsiveImage(imageUrl, {
      width: 600,
      height: 400,
    });
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--QmPjqg1S--/f_auto/c_fill,h_400,w_600/${imageUrl}`,
      width: 600,
      height: 400,
    });
  });

  it('asks for a custom transformation', () => {
    const result = resolveResponsiveImage(imageUrl, {
      width: 600,
      height: 400,
      transform: 'c_lfill,h_150,w_150',
    });
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--qWenXwR1--/f_auto/c_fill,h_400,w_600/c_lfill,h_150,w_150/${imageUrl}`,
      width: 600,
      height: 400,
    });
  });

  it('asks for sizes', () => {
    const result = resolveResponsiveImage(imageUrl, {
      width: 1600,
      sizes: [
        [800, 780],
        [1200, 1100],
      ]
    });
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

  it('asks for variants', () => {
    const result = resolveResponsiveImage(imageUrl, {
      width: 1600,
      sizes: [
        [800, 780],
        [1200, 1100],
      ],
      variants: [
        {
          media: '(max-width: 800px) and (orientation: portrait)',
          width: 800,
          sizes: [
            [400, 380],
            [600, 580]
          ],
          transform: 'co_rgb:000000,e_colorize:60',
        },
        {
           media: '(max-width: 1200px) and (orientation: portrait)',
           width: 1200,
           sizes: [
            [1000, 980],
            [1100, 1080]
          ],
          transform: 'co_rgb:000000,e_colorize:30'
        }
      ]
    });
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--aDf84wZ---/f_auto/c_scale,w_1600/${imageUrl}`,
      width: 1600,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `${cloudinaryFetchUrl}/s--9R_Nlnad--/f_auto/c_scale,w_780/${imageUrl} 780w`,
        `${cloudinaryFetchUrl}/s--tNMhIIt8--/f_auto/c_scale,w_1100/${imageUrl} 1100w`,
      ].join(', '),
      sources: [
        {
          media: '(max-width: 800px) and (orientation: portrait)',
          width: 800,
          srcset: [
            `${cloudinaryFetchUrl}/s--iEXyKcRd--/f_auto/c_scale,w_380/co_rgb:000000,e_colorize:60/${imageUrl} 380w`,
            `${cloudinaryFetchUrl}/s--nLdDPUc7--/f_auto/c_scale,w_580/co_rgb:000000,e_colorize:60/${imageUrl} 580w`,
          ].join(', '),
          sizes: '(max-width: 400px) 380px, (max-width: 600px) 580px, 800px',
        },
        {
          media: '(max-width: 1200px) and (orientation: portrait)',
          width: 1200,
          srcset: [
            `${cloudinaryFetchUrl}/s--LG2eSHZy--/f_auto/c_scale,w_980/co_rgb:000000,e_colorize:30/${imageUrl} 980w`,
            `${cloudinaryFetchUrl}/s--dwGp0r6v--/f_auto/c_scale,w_1080/co_rgb:000000,e_colorize:30/${imageUrl} 1080w`,
          ].join(', '),
          sizes: '(max-width: 1000px) 980px, (max-width: 1100px) 1080px, 1200px',
        }
      ],
    });
  });

  it('asks for a complete test, with height calculation, variants, custom transformations', () => {
    const result = resolveResponsiveImage(imageUrl, {
      width: 1600,
      height: 1200,
      sizes: [
        [800, 780],
        [1200, 1100],
      ],
      transform: 'co_rgb:000000,e_colorize:90',
      variants: [
        {
          media: '(max-width: 800px) and (orientation: portrait)',
          width: 800,
          height: 1000,
          sizes: [
            [400, 380],
            [600, 580]
          ],
          transform: 'co_rgb:000000,e_colorize:60',
        },
        {
           media: '(max-width: 1200px) and (orientation: portrait)',
           width: 1200,
           height: 1500,
           sizes: [
            [1000, 980],
            [1100, 1080]
          ],
          transform: 'co_rgb:000000,e_colorize:30'
        }
      ]
    });
    expect(result).toStrictEqual({
      src: `${cloudinaryFetchUrl}/s--HajkvDOl--/f_auto/c_fill,h_1200,w_1600/co_rgb:000000,e_colorize:90/${imageUrl}`,
      width: 1600,
      height: 1200,
      sizes: '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      srcset: [
        `${cloudinaryFetchUrl}/s--LrbguHed--/f_auto/c_fill,h_585,w_780/co_rgb:000000,e_colorize:90/${imageUrl} 780w`,
        `${cloudinaryFetchUrl}/s--NrLexxyx--/f_auto/c_fill,h_825,w_1100/co_rgb:000000,e_colorize:90/${imageUrl} 1100w`,
      ].join(', '),
      sources: [
        {
          media: '(max-width: 800px) and (orientation: portrait)',
          width: 800,
          height: 1000,
          srcset: [
            `${cloudinaryFetchUrl}/s--rFTn2kdY--/f_auto/c_fill,h_475,w_380/co_rgb:000000,e_colorize:60/${imageUrl} 380w`,
            `${cloudinaryFetchUrl}/s--N5VnQ0XM--/f_auto/c_fill,h_725,w_580/co_rgb:000000,e_colorize:60/${imageUrl} 580w`,
          ].join(', '),
          sizes: '(max-width: 400px) 380px, (max-width: 600px) 580px, 800px',
        },
        {
          media: '(max-width: 1200px) and (orientation: portrait)',
          width: 1200,
          height: 1500,
          srcset: [
            `${cloudinaryFetchUrl}/s--6tB__bYy--/f_auto/c_fill,h_1225,w_980/co_rgb:000000,e_colorize:30/${imageUrl} 980w`,
            `${cloudinaryFetchUrl}/s--ItybU5RI--/f_auto/c_fill,h_1350,w_1080/co_rgb:000000,e_colorize:30/${imageUrl} 1080w`,
          ].join(', '),
          sizes: '(max-width: 1000px) 980px, (max-width: 1100px) 1080px, 1200px',
        }
      ],
    });
  });
});
