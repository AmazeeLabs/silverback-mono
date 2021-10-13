import fs from 'fs';
import mock from 'mock-fs';

import { readPackageInfo, writePackageInfo } from '../helpers';

afterEach(mock.restore);

describe('readPackageInfo', () => {
  it('returns contents of package.json', () => {
    const content = { foo: 'bar' };
    mock({
      './foo': {
        'package.json': JSON.stringify(content),
      },
    });
    expect(readPackageInfo('./foo')).toEqual(content);
  });

  it('raises an error if there is no package.json', () => {
    mock({
      './foo': {},
    });
    expect(() => readPackageInfo('./foo')).toThrowError(
      `./foo does not contain a package.json file`,
    );
  });

  it('raises an error if the package does not exist', () => {
    mock({
      './foo': {},
    });
    expect(() => readPackageInfo('./bar')).toThrowError(
      `./bar does not contain a package.json file`,
    );
  });
});

describe('writePackageInfo', () => {
  const content = { foo: 'bar' };
  it('writes formatted contents to package.json', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({}),
      },
    });
    writePackageInfo('./foo', content);
    expect(fs.readFileSync('./foo/package.json').toString()).toEqual(
      JSON.stringify(content, null, 2) + '\n',
    );
  });

  it('raises an error if there is no package.json', () => {
    mock({
      './foo': {},
    });
    expect(() => writePackageInfo('./foo', content)).toThrowError(
      `./foo does not contain a package.json file`,
    );
  });

  it('raises an error if the package does not exist', () => {
    mock({
      './foo': {},
    });
    expect(() => writePackageInfo('./foo', content)).toThrowError(
      `./foo does not contain a package.json file`,
    );
  });
});
