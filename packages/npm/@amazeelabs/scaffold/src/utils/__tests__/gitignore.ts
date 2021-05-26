import * as fs from 'fs';
import mock from 'mock-fs';

import { manageIgnoredFiles } from '../gitignore';

afterEach(mock.restore);

describe('manageGitIgnore', () => {
  it('creates a .gitignore file if it does not exist', () => {
    mock({
      '/foo': {
        '.eslintrc.js': 'a',
      },
      '/bar': {},
    });
    manageIgnoredFiles('/foo', '/bar');
    expect(fs.existsSync('/bar/.gitignore')).toBeTruthy();
    expect(fs.readFileSync('/bar/.gitignore').toString()).toEqual(
      [
        '### MANAGED BY @amazeelabs/scaffold - START',
        '.eslintrc.js',
        '### MANAGED BY @amazeelabs/scaffold - END',
      ].join('\n'),
    );
  });
  it('injects ignores into and existing ignore file', () => {
    mock({
      '/foo': {
        '.eslintrc.js': 'a',
      },
      '/bar': {
        '.gitignore': `node_modules`,
      },
    });
    manageIgnoredFiles('/foo', '/bar');
    expect(fs.existsSync('/bar/.gitignore')).toBeTruthy();
    expect(fs.readFileSync('/bar/.gitignore').toString()).toEqual(
      [
        'node_modules',
        '### MANAGED BY @amazeelabs/scaffold - START',
        '.eslintrc.js',
        '### MANAGED BY @amazeelabs/scaffold - END',
      ].join('\n'),
    );
  });
  it('it updates existing managed ignores in a file', () => {
    mock({
      '/foo': {
        '.eslintrc.js': 'a',
        '.prettierrc': 'a',
      },
      '/bar': {
        '.gitignore': [
          'node_modules',
          '### MANAGED BY @amazeelabs/scaffold - START',
          '.eslintrc.js',
          '### MANAGED BY @amazeelabs/scaffold - END',
        ].join('\n'),
      },
    });
    manageIgnoredFiles('/foo', '/bar');
    expect(fs.existsSync('/bar/.gitignore')).toBeTruthy();
    expect(fs.readFileSync('/bar/.gitignore').toString()).toEqual(
      [
        'node_modules',
        '### MANAGED BY @amazeelabs/scaffold - START',
        '.eslintrc.js',
        '.prettierrc',
        '### MANAGED BY @amazeelabs/scaffold - END',
      ].join('\n'),
    );
  });
});
