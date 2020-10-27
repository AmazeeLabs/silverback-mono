import { render } from '@testing-library/react';
import React from 'react';

import { createDependencyContext } from './index';

afterEach(() => {
  jest.restoreAllMocks();
});

test('missing dependency provider', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  const [, , useDependencies] = createDependencyContext<{
    foo: () => {};
  }>();

  const Bar: React.FC = () => {
    useDependencies().foo();
    return null;
  };

  expect(() => render(<Bar />)).toThrow(
    'Dependency context has not been initialised.',
  );
  expect(error).toHaveBeenCalledTimes(2);
});

test('dependency injection', () => {
  const foo = jest.fn();
  const [Provider, , useDependencies] = createDependencyContext<{
    foo: () => {};
  }>();

  const Bar: React.FC = () => {
    useDependencies().foo();
    return null;
  };

  render(
    <Provider dependencies={{ foo }}>
      <Bar />
    </Provider>,
  );
  expect(foo).toHaveBeenCalledTimes(1);
});

test('dependency override', () => {
  const foo = jest.fn();
  const bar = jest.fn();
  const baz = jest.fn();
  const [Provider, Override, useDependencies] = createDependencyContext<{
    foo: () => {};
    bar: () => {};
  }>();

  const Bar: React.FC = () => {
    useDependencies().foo();
    useDependencies().bar();
    return null;
  };

  render(
    <Provider dependencies={{ foo, bar }}>
      <Bar />
      <Override dependencies={{ bar: baz }}>
        <Bar />
      </Override>
    </Provider>,
  );
  expect(foo).toHaveBeenCalledTimes(2);
  expect(bar).toHaveBeenCalledTimes(1);
  expect(baz).toHaveBeenCalledTimes(1);
});
