import { describe, expect, it } from 'vitest';

import { isDownload, Url } from './index';

describe('isDownload', () => {
  it('detects that undefined is not a download', () => {
    expect(isDownload()).toBe(false);
  });
  it('detects that regular link is not a download', () => {
    expect(isDownload(new URL('http://a.b/asd'))).toBe(false);
    expect(isDownload('/asd' as Url)).toBe(false);
  });
  it('detects that a link with an extension is a download', () => {
    expect(isDownload(new URL('http://a.b/asd.foo'))).toBe(true);
    expect(isDownload('/asd.foo' as Url)).toBe(true);
  });
});
