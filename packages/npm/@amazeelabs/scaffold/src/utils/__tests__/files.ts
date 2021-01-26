import * as fs from 'fs';
import mock from 'mock-fs';

import { ignoredFiles } from '../../index';
import { updateDotFiles } from '../files';

afterEach(mock.restore);

describe('updateDotFiles', () => {
  it('adds missing files', () => {
    mock({
      '/foo': {
        '.eslintrc.js': 'a',
      },
      '/bar': {},
    });
    updateDotFiles('/foo', '/bar', ignoredFiles);
    expect(fs.existsSync('/bar/.eslintrc.js')).toBeTruthy();
    expect(fs.readFileSync('/bar/.eslintrc.js').toString()).toEqual('a');
  });

  it('replaces existing files', () => {
    mock({
      '/foo': {
        '.eslintrc.js': 'b',
      },
      '/bar': {
        '.eslintrc.js': 'a',
      },
    });
    updateDotFiles('/foo', '/bar', ignoredFiles);
    expect(fs.existsSync('/bar/.eslintrc.js')).toBeTruthy();
    expect(fs.readFileSync('/bar/.eslintrc.js').toString()).toEqual('b');
  });

  it('skips ignored files', () => {
    mock({
      '/foo': {
        'package.json': 'b',
      },
      '/bar': {
        'package.json': 'a',
      },
    });
    updateDotFiles('/foo', '/bar', ignoredFiles);
    expect(fs.existsSync('/bar/package.json')).toBeTruthy();
    expect(fs.readFileSync('/bar/package.json').toString()).toEqual('a');
  });
});
