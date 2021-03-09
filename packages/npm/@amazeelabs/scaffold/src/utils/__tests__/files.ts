import * as fs from 'fs';
import mock from 'mock-fs';

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
    updateDotFiles('/foo', '/bar');
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
    updateDotFiles('/foo', '/bar');
    expect(fs.existsSync('/bar/.eslintrc.js')).toBeTruthy();
    expect(fs.readFileSync('/bar/.eslintrc.js').toString()).toEqual('b');
  });
});
