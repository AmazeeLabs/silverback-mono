import { describe, expect, it } from 'vitest';

import { drawDimensions, parseCloudinaryUrl } from './worker-lib';

describe('parseCloudinaryUrl', () => {
  it('returns undefined if its not a cloudinary url', () => {
    expect(parseCloudinaryUrl('https://example.com')).toBeUndefined();
  });
  it('returns debug=true if the cloudname is "debug"', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/debug/image/fetch/abc/f_auto/w_500/r_max//landscape.jpg',
      )!.debug,
    ).toBeTruthy();
  });
  it('returns debug=false if the cloudname is anything else', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/anythingelse/image/fetch/abc/f_auto/w_500/r_max//landscape.jpg',
      )!.debug,
    ).toBeFalsy();
  });
  it('extracts a relative image source', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/debug/image/fetch/abc/f_auto/w_500/r_max//landscape.jpg',
      )!.src,
    ).toBe('/landscape.jpg');
  });
  it('extracts an absolute image source', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/debug/image/fetch/abc/f_auto/w_500/r_max/https://example.com/landscape.jpg',
      )!.src,
    ).toBe('https://example.com/landscape.jpg');
  });
  it('extracts no transform', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/debug/image/fetch/abc/f_auto//landscape.jpg',
      )!.src,
    ).toBe('/landscape.jpg');
  });
  it('extracts a single transform', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/debug/image/fetch/abc/f_auto/c_scale//landscape.jpg',
      )!.transform,
    ).toBe('c_scale');
  });
  it('extracts a transform chain', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/debug/image/fetch/abc/f_auto/c_scale/r_max//landscape.jpg',
      )!.transform,
    ).toBe('c_scale/r_max');
  });
  it('extracts the last width transform', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/debug/image/fetch/abc/f_auto/c_scale,w_500/r_max,w_100//landscape.jpg',
      )!.width,
    ).toBe(100);
  });
  it('extracts the last height transform', () => {
    expect(
      parseCloudinaryUrl(
        'https://res.cloudinary.com/debug/image/fetch/abc/f_auto/c_scale,h_500/r_max,h_100//landscape.jpg',
      )!.height,
    ).toBe(100);
  });
});

describe('drawDimensions', () => {
  it('draws the original dimensions if there are no target dimensions', () => {
    expect(drawDimensions(100, 200, undefined, undefined)).toEqual([100, 200]);
  });
  it('scales the width if only the width is given', () => {
    expect(drawDimensions(100, 200, 50, undefined)).toEqual([50, 100]);
  });
  it('scales down to match container width', () => {
    expect(drawDimensions(100, 50, 80, 30)).toEqual([80, 40]);
  });
  it('scales down to match container height', () => {
    expect(drawDimensions(100, 50, 50, 40)).toEqual([80, 40]);
  });
});
