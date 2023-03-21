import { describe, expect, it } from 'vitest';

import { overrideUrlParameters } from './link';

describe('overrideUrlParameters', () => {
  it('works with an absolute url', () => {
    expect(overrideUrlParameters('https://example.com', {}, '')).toBe(
      'https://example.com',
    );
  });

  it('works with a relative url', () => {
    expect(overrideUrlParameters('/foo', {}, '')).toBe('/foo');
  });

  it('allows to add query arguments', () => {
    expect(overrideUrlParameters('/foo', { a: 'x' }, '')).toBe('/foo?a=x');
  });

  it('allows to remove query arguments', () => {
    expect(overrideUrlParameters('/foo?a=x', { a: null }, '')).toBe('/foo');
  });

  it('allows to override query arguments', () => {
    expect(overrideUrlParameters('/foo?a=x', { a: 'y' }, '')).toBe('/foo?a=y');
  });

  it('leaves query arguments that are not overridden', () => {
    expect(overrideUrlParameters('/foo?a=x&b=x', { b: 'y' }, '')).toBe(
      '/foo?a=x&b=y',
    );
  });

  it('allows to add a fragment', () => {
    expect(overrideUrlParameters('/foo', {}, 'bar')).toBe('/foo#bar');
  });

  it('allows to override a fragment', () => {
    expect(overrideUrlParameters('/foo#bar', {}, 'baz')).toBe('/foo#baz');
  });

  it('allows to remove a fragment', () => {
    expect(overrideUrlParameters('/foo#bar', {}, '')).toBe('/foo');
  });

  it('leaves the fragment when overriding query arguments', () => {
    expect(overrideUrlParameters('/foo?a=x#bar', { b: 'y' }, 'bar')).toBe(
      '/foo?a=x&b=y#bar',
    );
  });
});
