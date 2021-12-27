import * as fs from 'fs';
import mock from 'mock-fs';

import { installConfigFiles } from '../files';
import { fixMockFs } from '../fix-mock-fs';

afterEach(mock.restore);

fixMockFs();

describe('installConfigFiles', () => {
  it('adds missing files', () => {
    mock({
      '/foo': {
        '.eslintrc.js': 'a',
      },
      '/bar': {},
    });
    installConfigFiles('/foo', '/bar');
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
    installConfigFiles('/foo', '/bar');
    expect(fs.existsSync('/bar/.eslintrc.js')).toBeTruthy();
    expect(fs.readFileSync('/bar/.eslintrc.js').toString()).toEqual('b');
  });
});
