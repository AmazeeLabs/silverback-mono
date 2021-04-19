import { minimalVersion } from '../versions';

describe('minimalVersion', () => {
  it('returns false on invalid input', () => {
    expect(minimalVersion('12')('schnitzel')).toBeTruthy();
  });
  it('returns false on unmet requirements', () => {
    expect(minimalVersion('12')('v11.2')).toBeTruthy();
  });
  it('returns true if requirements are met', () => {
    expect(minimalVersion('12')('v12.0.0')).toBeFalsy();
    expect(minimalVersion('12')('v13.11')).toBeFalsy();
  });

  it('handles node -v output', () => {
    expect(minimalVersion('12')('v13.11.0\n')).toBeFalsy();
    expect(minimalVersion('14')('v13.11.0\n')).toBeTruthy();
  });

  it('handles yarn -v output', () => {
    expect(minimalVersion('1.0')('1.22.5\n')).toBeFalsy();
    expect(minimalVersion('1.0')('0.11.2\n')).toBeTruthy();
  });

  it('handles php -v output', () => {
    const phpVersion = `PHP 7.4.16 (cli) (built: Mar  4 2021 20:52:51) ( NTS )
Copyright (c) The PHP Group
Zend Engine v3.4.0, Copyright (c) Zend Technologies
    with Xdebug v2.9.6, Copyright (c) 2002-2020, by Derick Rethans
    with Zend OPcache v7.4.16, Copyright (c), by Zend Technologies
`;
    expect(minimalVersion('7.4')(phpVersion)).toBeFalsy();
    expect(minimalVersion('8')(phpVersion)).toBeTruthy();
  });
});
