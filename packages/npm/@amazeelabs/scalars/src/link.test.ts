import { describe, expect, it } from 'vitest';

import { overrideUrlParameters } from './';

describe('overrideUrlParameters', () => {
  it('works with an absolute url', () => {
    expect(overrideUrlParameters('https://example.com', {}, '')).toBe(
      'https://example.com',
    );
  });

  it('works with a relative url', () => {
    expect(overrideUrlParameters('/foo', {}, '')).toBe('/foo');
  });

  it('allows to add search parameters', () => {
    expect(overrideUrlParameters('/foo', { a: 'x' }, '')).toBe('/foo?a=x');
  });

  it('allows to remove search parameters', () => {
    expect(overrideUrlParameters('/foo?a=x', { a: null }, '')).toBe('/foo');
  });

  it('allows to override search parameters', () => {
    expect(overrideUrlParameters('/foo?a=x', { a: 'y' }, '')).toBe('/foo?a=y');
  });

  it('leaves search parameters that are not overridden', () => {
    expect(overrideUrlParameters('/foo?a=x&b=x', { b: 'y' }, '')).toBe(
      '/foo?a=x&b=y',
    );
  });

  it('allows to add a hash', () => {
    expect(overrideUrlParameters('/foo', {}, 'bar')).toBe('/foo#bar');
  });

  it('allows to override a hash', () => {
    expect(overrideUrlParameters('/foo#bar', {}, 'baz')).toBe('/foo#baz');
  });

  it('allows to remove a hash', () => {
    expect(overrideUrlParameters('/foo#bar', {}, '')).toBe('/foo');
  });

  it('leaves the hash when overriding search parameters', () => {
    expect(overrideUrlParameters('/foo?a=x#bar', { b: 'y' }, 'bar')).toBe(
      '/foo?a=x&b=y#bar',
    );
  });
});
