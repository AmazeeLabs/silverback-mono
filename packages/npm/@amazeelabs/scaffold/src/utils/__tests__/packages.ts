import { execSync } from 'child_process';
import mock from 'mock-fs';

import { ignoredPackages } from '../../index';
import { installPackages } from '../packages';

afterEach(() => {
  mock.restore();
  jest.resetAllMocks();
});

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('installPackages', () => {
  test('does not execute without dependencies', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({}),
      },
      './bar': {
        'package.json': JSON.stringify({}),
      },
    });
    installPackages('./foo', './bar', ignoredPackages);
    expect(execSync).toHaveBeenCalledTimes(0);
  });

  test('installs missing dependencies as dev dependencies', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          dependencies: { a: '1.0', b: '1.0' },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({}),
      },
    });
    installPackages('./foo', './bar', ignoredPackages);
    expect(execSync).toHaveBeenCalledTimes(1);
    expect(execSync).toHaveBeenCalledWith(`yarn add -D a b`, {
      stdio: 'inherit',
    });
  });

  test('ignores already installed dependencies', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          dependencies: { a: '1.0', b: '1.0' },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({
          devDependencies: { b: '1.0' },
        }),
      },
    });
    installPackages('./foo', './bar', ignoredPackages);
    expect(execSync).toHaveBeenCalledTimes(1);
    expect(execSync).toHaveBeenCalledWith(`yarn add -D a`, {
      stdio: 'inherit',
    });
  });

  test('ignores dependencies on the ignore list', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          dependencies: { a: '1.0', chalk: '1.0' },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({}),
      },
    });
    installPackages('./foo', './bar', ignoredPackages);
    expect(execSync).toHaveBeenCalledTimes(1);
    expect(execSync).toHaveBeenCalledWith(`yarn add -D a`, {
      stdio: 'inherit',
    });
  });

  test('runs husky install if husky is among the dependencies', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          dependencies: { husky: '1.0' },
        }),
      },
      './bar': {
        'package.json': JSON.stringify({}),
      },
    });
    installPackages('./foo', './bar', ignoredPackages);
    expect(execSync).toHaveBeenCalledTimes(2);
    expect(execSync).toHaveBeenCalledWith(`yarn add -D husky`, {
      stdio: 'inherit',
    });
    expect(execSync).toHaveBeenCalledWith(`yarn husky install && rm -rf .husky`, {
      stdio: 'inherit',
    });
  });
});
