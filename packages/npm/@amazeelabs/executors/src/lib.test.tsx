// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import React, { PropsWithChildren, useState } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';

import { OperationExecutor, useExecutor } from './lib';

beforeEach(cleanup);

function Consumer({
  id,
  variables,
}: {
  id: string;
  variables?: Record<string, any>;
}) {
  const executor = useExecutor(id, variables);
  return (
    <p>{typeof executor === 'function' ? executor(variables) : executor}</p>
  );
}

test('no operator', () => {
  expect(() => render(<Consumer id={'unknown'} />)).toThrow();
});

test('global default operator', () => {
  expect(() =>
    render(
      <OperationExecutor executor={() => 'default'}>
        <Consumer id={'unknown'} />
      </OperationExecutor>,
    ),
  ).not.toThrow();
  expect(screen.getByText('default')).toBeDefined();
});

test('global default operator with arguments', () => {
  expect(() =>
    render(
      <OperationExecutor executor={(_: any, vars: any) => vars.foo}>
        <Consumer id={'unknown'} variables={{ foo: 'bar' }} />
      </OperationExecutor>,
    ),
  ).not.toThrow();
  expect(screen.getByText('bar')).toBeDefined();
});

test('operation default operator', () => {
  expect(() =>
    render(
      <OperationExecutor id={'a'} executor={() => 'operation a'}>
        <Consumer id={'a'} />
      </OperationExecutor>,
    ),
  ).not.toThrow();

  expect(screen.getByText('operation a')).toBeDefined();
});

test('operation default operator with arguments', () => {
  expect(() =>
    render(
      <OperationExecutor id={'a'} executor={(_: any, vars: any) => vars.foo}>
        <Consumer id={'a'} variables={{ foo: 'bar' }} />
      </OperationExecutor>,
    ),
  ).not.toThrow();
  expect(screen.getByText('bar')).toBeDefined();
});

test('structural argument matching', () => {
  const id = 'x';
  const a = vi.fn();
  const b = vi.fn();
  const c = vi.fn();

  expect(() =>
    render(
      <OperationExecutor id={id} executor={a} variables={{ y: 1 }}>
        <OperationExecutor executor={b} id={id} variables={{ y: 2 }}>
          <OperationExecutor executor={c} id={id} variables={{ y: 1, z: 1 }}>
            <Consumer id={id} variables={{ y: 1, z: 1 }} />
            <Consumer id={id} variables={{ y: 1 }} />
            <Consumer id={id} variables={{ y: 2 }} />
          </OperationExecutor>
        </OperationExecutor>
      </OperationExecutor>,
    ),
  ).not.toThrow();

  expect(a).toHaveBeenCalledOnce();
  expect(a).toHaveBeenCalledWith(id, { y: 1 });
  expect(b).toHaveBeenCalledOnce();
  expect(b).toHaveBeenCalledWith(id, { y: 2 });
  expect(c).toHaveBeenCalledOnce();
  expect(c).toHaveBeenCalledWith(id, { y: 1, z: 1 });
});

test('structural argument mismatch', () => {
  const id = 'x';
  const a = vi.fn();
  const b = vi.fn();
  const c = vi.fn();

  expect(() =>
    render(
      <OperationExecutor id={id} executor={a} variables={{ y: 1 }}>
        <OperationExecutor executor={b} id={id} variables={{ y: 2 }}>
          <OperationExecutor executor={c} id={id} variables={{ y: 1, z: 1 }}>
            <Consumer id={id} variables={{ y: 3 }} />
          </OperationExecutor>
        </OperationExecutor>
      </OperationExecutor>,
    ),
  ).toThrow(
    'No executor found for: x:{"y":3} Candidates: x:{"y":1} x:{"y":2} x:{"y":1,"z":1}',
  );
});

test('static data resolution', () => {
  const id = 'x';

  expect(() =>
    render(
      <OperationExecutor id={id} executor={() => 'static data'}>
        <Consumer id={id} />
      </OperationExecutor>,
    ),
  ).not.toThrow();
  expect(screen.getByText('static data')).toBeDefined();
});

test('static data resolution with arguments', () => {
  const id = 'x';

  expect(() =>
    render(
      <OperationExecutor id={id} executor={'static data'} variables={{ y: 1 }}>
        <Consumer id={id} variables={{ y: 1 }} />
      </OperationExecutor>,
    ),
  ).not.toThrow();
  expect(screen.getByText('static data')).toBeDefined();
});

test('static data updates', () => {
  const id = 'x';

  function Executor({ children }: PropsWithChildren) {
    const [count, setCount] = useState(0);
    return (
      <>
        <button onClick={() => setCount(count + 1)}>Up</button>
        <OperationExecutor id={id} executor={count} variables={{ y: 1 }}>
          {children}
        </OperationExecutor>
      </>
    );
  }

  expect(() =>
    render(
      <Executor>
        <Consumer id={id} variables={{ y: 1 }} />
      </Executor>,
    ),
  ).not.toThrow();

  expect(screen.getByText(0)).toBeDefined();

  act(() => {
    fireEvent.click(screen.getByText(/Up/));
  });

  expect(screen.getByText(1)).toBeDefined();
});
