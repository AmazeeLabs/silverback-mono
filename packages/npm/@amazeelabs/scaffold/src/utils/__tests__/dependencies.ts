import mock from 'mock-fs';

import { installDependencies } from '../dependencies';
import { fixMockFs } from '../fix-mock-fs';
import { readPackageInfo } from '../helpers';

afterEach(mock.restore);

fixMockFs();

describe('installDependencies', () => {
  test('installs packages in their current version', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({}),
      },
    });
    installDependencies('./foo');
    expect(readPackageInfo('./foo').devDependencies).toHaveProperty(
      '@amazeelabs/eslint-config',
    );
  });

  test('installs peer dependencies as dev dependencies', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({}),
      },
    });
    installDependencies('./foo');
    expect(readPackageInfo('./foo').devDependencies).toHaveProperty('eslint');
  });

  test('updates existing dependencies', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          devDependencies: {
            eslint: '1.0',
          },
        }),
      },
    });
    installDependencies('./foo');
    expect(readPackageInfo('./foo').devDependencies).toHaveProperty('eslint');
    expect(readPackageInfo('./foo').devDependencies?.eslint).not.toEqual('1.0');
  });
});
