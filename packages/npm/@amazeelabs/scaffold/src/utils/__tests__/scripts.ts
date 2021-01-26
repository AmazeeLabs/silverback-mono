import * as fs from 'fs';
import mock from 'mock-fs';

import { ignoredScripts } from '../../index';
import { adjustScripts } from '../scripts';

afterEach(mock.restore);

describe('adjustScripts', () => {
  it('inserts missing scripts', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          scripts: {
            test: 'jest',
          },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({}),
      },
    });
    adjustScripts('./foo', './bar', ignoredScripts);
    expect(
      JSON.parse(fs.readFileSync('./bar/package.json').toString()),
    ).toEqual({
      scripts: {
        postinstall: 'amazee-scaffold',
        test: 'jest',
      },
    });
  });

  it('skips ignored scripts', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          scripts: {
            test: 'jest',
            prepare: 'tsc',
          },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({}),
      },
    });
    adjustScripts('./foo', './bar', ignoredScripts);
    expect(
      JSON.parse(fs.readFileSync('./bar/package.json').toString()),
    ).toEqual({
      scripts: {
        postinstall: 'amazee-scaffold',
        test: 'jest',
      },
    });
  });

  it('extends existing scripts', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          scripts: {
            test: 'jest',
          },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({
          scripts: {
            test: 'cypress',
          },
        }),
      },
    });
    adjustScripts('./foo', './bar', ignoredScripts);
    expect(
      JSON.parse(fs.readFileSync('./bar/package.json').toString()),
    ).toEqual({
      scripts: {
        postinstall: 'amazee-scaffold',
        test: 'jest && cypress',
      },
    });
  });

  it('does not double-extend existing scripts', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          scripts: {
            test: 'jest',
          },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({
          scripts: {
            test: 'jest && cypress',
          },
        }),
      },
    });
    adjustScripts('./foo', './bar', ignoredScripts);
    expect(
      JSON.parse(fs.readFileSync('./bar/package.json').toString()),
    ).toEqual({
      scripts: {
        postinstall: 'amazee-scaffold',
        test: 'jest && cypress',
      },
    });
  });
});
