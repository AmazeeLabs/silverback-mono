import { describe, expect, it } from 'vitest';

import { buildResponsiveImage } from './responsive_image';

describe('buildResponsiveImage()', () => {
  const credentials = {
    secret: 'test',
    key: 'test',
    cloudname: 'vitest',
  };

  const imageProps = {
    src: 'http://www.example.com/test_image.png',
    width: 1600,
    height: 1200,
  };

  it('asks for the original image', () => {
    const result = JSON.parse(buildResponsiveImage(credentials, imageProps));
    expect(result).toStrictEqual({
      originalSrc: 'http://www.example.com/test_image.png',
      ...imageProps,
    });
  });

  it('asks for a width (scale image)', () => {
    const result = JSON.parse(
      buildResponsiveImage(credentials, imageProps, {
        width: 600,
      }),
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "height": 450,
        "originalSrc": "http://www.example.com/test_image.png",
        "src": "https://res.cloudinary.com/vitest/image/fetch/s--1SSv3TAe--/f_auto/q_auto/c_scale,w_600/http://www.example.com/test_image.png",
        "width": 600,
      }
    `);
  });

  it('asks for a width and height', () => {
    const result = JSON.parse(
      buildResponsiveImage(credentials, imageProps, {
        width: 600,
        height: 400,
      }),
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "height": 400,
        "originalSrc": "http://www.example.com/test_image.png",
        "src": "https://res.cloudinary.com/vitest/image/fetch/s--oQnrp4QO--/f_auto/q_auto/c_fill,g_auto,h_400,w_600/http://www.example.com/test_image.png",
        "width": 600,
      }
    `);
  });

  it('asks for a custom transformation', () => {
    const result = JSON.parse(
      buildResponsiveImage(credentials, imageProps, {
        width: 600,
        height: 400,
        transform: 'c_lfill,h_150,w_150',
      }),
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "height": 400,
        "originalSrc": "http://www.example.com/test_image.png",
        "src": "https://res.cloudinary.com/vitest/image/fetch/s--iBYmBJnf--/f_auto/q_auto/c_fill,g_auto,h_400,w_600/c_lfill,h_150,w_150/http://www.example.com/test_image.png",
        "width": 600,
      }
    `);
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
    expect(result).toMatchInlineSnapshot(`
      {
        "height": 1200,
        "originalSrc": "http://www.example.com/test_image.png",
        "sizes": "(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px",
        "src": "https://res.cloudinary.com/vitest/image/fetch/s--do7-bAD9--/f_auto/q_auto/c_scale,w_1600/http://www.example.com/test_image.png",
        "srcset": "https://res.cloudinary.com/vitest/image/fetch/s--MZkCHWuY--/f_auto/q_auto/c_scale,w_780/http://www.example.com/test_image.png 780w, https://res.cloudinary.com/vitest/image/fetch/s--xlf_u2mA--/f_auto/q_auto/c_scale,w_1100/http://www.example.com/test_image.png 1100w",
        "width": 1600,
      }
    `);
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
    expect(result).toMatchInlineSnapshot(`
      {
        "height": 1200,
        "originalSrc": "http://www.example.com/test_image.png",
        "sizes": "(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px",
        "src": "https://res.cloudinary.com/vitest/image/fetch/s--PYehk6Pp--/f_auto/q_auto/c_fill,g_auto,h_1200,w_1600/co_rgb:000000,e_colorize:90/http://www.example.com/test_image.png",
        "srcset": "https://res.cloudinary.com/vitest/image/fetch/s--0q-v7sf8--/f_auto/q_auto/c_fill,g_auto,h_585,w_780/co_rgb:000000,e_colorize:90/http://www.example.com/test_image.png 780w, https://res.cloudinary.com/vitest/image/fetch/s--1PnC9sUX--/f_auto/q_auto/c_fill,g_auto,h_825,w_1100/co_rgb:000000,e_colorize:90/http://www.example.com/test_image.png 1100w",
        "width": 1600,
      }
    `);
  });

  it('returns a mock image when cloudname is "demo"', () => {
    const result = JSON.parse(
      buildResponsiveImage(
        {
          cloudname: 'demo',
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
    expect(result).toMatchInlineSnapshot(`
      {
        "height": 1200,
        "originalSrc": "http://www.example.com/test_image.png",
        "sizes": "(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px",
        "src": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAwIiBoZWlnaHQ9IjEyMDAiIHZpZXdCb3g9IjAgMCAxNjAwIDEyMDAiPjwvc3ZnPg==",
        "srcset": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3ODAiIGhlaWdodD0iNTg1IiB2aWV3Qm94PSIwIDAgNzgwIDU4NSI+PC9zdmc+ 780w, data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTAwIiBoZWlnaHQ9IjgyNSIgdmlld0JveD0iMCAwIDExMDAgODI1Ij48L3N2Zz4= 1100w",
        "width": 1600,
      }
    `);
  });

  it('adds debug info when cloudname is "test"', () => {
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
    expect(result).toMatchInlineSnapshot(`
      {
        "height": 1200,
        "originalSrc": "http://www.example.com/test_image.png",
        "sizes": "(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px",
        "src": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAwIiBoZWlnaHQ9IjEyMDAiIHZpZXdCb3g9IjAgMCAxNjAwIDEyMDAiPjxyZWN0IHg9IjAiIHk9IjU0MCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTIwIiBmaWxsPSJyZ2JhKDAsMCwwLDAuNSkiPjwvcmVjdD48dGV4dCBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIHg9IjUwJSIgeT0iNTAlIiBzdHlsZT0iZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7Zm9udC1zaXplOiA5NjtsaW5lLWhlaWdodDogOTY7Zm9udC13ZWlnaHQ6Ym9sZDt0ZXh0LWFuY2hvcjogbWlkZGxlOyBkb21pbmFudC1iYXNlbGluZTogY2VudHJhbDsiPjE2MDAgeCAxMjAwPC90ZXh0Pjwvc3ZnPg==",
        "srcset": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3ODAiIGhlaWdodD0iNTg1IiB2aWV3Qm94PSIwIDAgNzgwIDU4NSI+PHJlY3QgeD0iMCIgeT0iMjYzLjUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjU4IiBmaWxsPSJyZ2JhKDAsMCwwLDAuNSkiPjwvcmVjdD48dGV4dCBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIHg9IjUwJSIgeT0iNTAlIiBzdHlsZT0iZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7Zm9udC1zaXplOiA0NjtsaW5lLWhlaWdodDogNDY7Zm9udC13ZWlnaHQ6Ym9sZDt0ZXh0LWFuY2hvcjogbWlkZGxlOyBkb21pbmFudC1iYXNlbGluZTogY2VudHJhbDsiPjc4MCB4IDU4NTwvdGV4dD48L3N2Zz4= 780w, data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTAwIiBoZWlnaHQ9IjgyNSIgdmlld0JveD0iMCAwIDExMDAgODI1Ij48cmVjdCB4PSIwIiB5PSIzNzEuNSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iODIiIGZpbGw9InJnYmEoMCwwLDAsMC41KSI+PC9yZWN0Pjx0ZXh0IGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIgeD0iNTAlIiB5PSI1MCUiIHN0eWxlPSJmb250LWZhbWlseTogc2Fucy1zZXJpZjtmb250LXNpemU6IDY1O2xpbmUtaGVpZ2h0OiA2NTtmb250LXdlaWdodDpib2xkO3RleHQtYW5jaG9yOiBtaWRkbGU7IGRvbWluYW50LWJhc2VsaW5lOiBjZW50cmFsOyI+MTEwMCB4IDgyNTwvdGV4dD48L3N2Zz4= 1100w",
        "width": 1600,
      }
    `);
  });
});
