import mock from 'mock-fs';

import { getPackageInfo } from '../helpers';

afterEach(mock.restore);

test('getPackageInfo returns contents of package.json', () => {
  const content = { foo: 'bar' };
  mock({
    './foo': {
      'package.json': JSON.stringify(content),
    },
  });
  expect(getPackageInfo('./foo')).toEqual(content);
});

test('getPackageInfo raised an error if there is no package.json', () => {
  mock({
    './foo': {},
  });
  expect(() => getPackageInfo('./foo')).toThrowError(
    `./foo does not contain a package.json file`,
  );
});

test('getPackageInfo raised an error if the package does not exist', () => {
  mock({
    './foo': {},
  });
  expect(() => getPackageInfo('./bar')).toThrowError(
    `./bar does not contain a package.json file`,
  );
});
