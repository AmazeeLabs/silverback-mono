import { describe, expect, it } from 'vitest';

import { overrideUrlParameters, Url } from './';

describe('overrideUrlParameters', () => {
  it('works with an absolute url', () => {
    expect(overrideUrlParameters('https://example.com' as Url, {}, '')).toBe(
      'https://example.com',
    );
  });

  it('works with a relative url', () => {
    expect(overrideUrlParameters('/foo' as Url, {}, '')).toBe('/foo');
  });

  it('allows to add search parameters', () => {
    expect(overrideUrlParameters('/foo' as Url, { a: 'x' }, '')).toBe(
      '/foo?a=x',
    );
  });

  it('allows to remove search parameters', () => {
    expect(overrideUrlParameters('/foo?a=x' as Url, { a: null }, '')).toBe(
      '/foo',
    );
  });

  it('allows to override search parameters', () => {
    expect(overrideUrlParameters('/foo?a=x' as Url, { a: 'y' }, '')).toBe(
      '/foo?a=y',
    );
  });

  it('leaves search parameters that are not overridden', () => {
    expect(overrideUrlParameters('/foo?a=x&b=x' as Url, { b: 'y' }, '')).toBe(
      '/foo?a=x&b=y',
    );
  });

  it('allows to add a hash', () => {
    expect(overrideUrlParameters('/foo' as Url, {}, 'bar')).toBe('/foo#bar');
  });

  it('allows to override a hash', () => {
    expect(overrideUrlParameters('/foo#bar' as Url, {}, 'baz')).toBe(
      '/foo#baz',
    );
  });

  it('allows to remove a hash', () => {
    expect(overrideUrlParameters('/foo#bar' as Url, {}, '')).toBe('/foo');
  });

  it('leaves the hash when overriding search parameters', () => {
    expect(
      overrideUrlParameters('/foo?a=x#bar' as Url, { b: 'y' }, 'bar'),
    ).toBe('/foo?a=x&b=y#bar');
  });

  it('allows to use a Location object', () => {
    expect(
      overrideUrlParameters(
        {
          pathname: '/foo',
          search: new URLSearchParams('?a=x'),
          hash: 'bar',
        },
        { b: 'y' },
        'baz',
      ),
    ).toEqual('/foo?a=x&b=y#baz');
  });
});
