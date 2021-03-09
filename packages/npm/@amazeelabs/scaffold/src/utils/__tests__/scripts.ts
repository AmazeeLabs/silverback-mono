import * as fs from 'fs';
import mock from 'mock-fs';

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
    adjustScripts('./foo', './bar');
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
    adjustScripts('./foo', './bar');
    expect(
      JSON.parse(fs.readFileSync('./bar/package.json').toString()),
    ).toEqual({
      scripts: {
        postinstall: 'amazee-scaffold',
        test: 'jest && cypress',
      },
    });
  });

  it('ignores the postinstall script in @amazeelabs/scaffold', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          scripts: {
            postinstall: 'amazee-scaffold',
          },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({
          name: '@amazeelabs/scaffold',
          scripts: {
            postinstall: 'node cli.js',
          },
        }),
      },
    });
    adjustScripts('./foo', './bar');
    expect(
        JSON.parse(fs.readFileSync('./bar/package.json').toString()),
    ).toEqual({
      name: '@amazeelabs/scaffold',
      scripts: {
        postinstall: 'node cli.js',
      },
    });
  })

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
    adjustScripts('./foo', './bar');
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
