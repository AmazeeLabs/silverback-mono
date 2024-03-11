import { beforeEach, expect, test, vi } from 'vitest';

import { clearRegistry, createExecutor, registerExecutor } from './lib';

beforeEach(clearRegistry);

test('no operator', () => {
  expect(() => createExecutor('unknown')).toThrow();
});

test('global default operator', () => {
  const op = vi.fn();
  registerExecutor(op);
  expect(() => createExecutor('unknown')()).not.toThrow();
  expect(op).toHaveBeenCalledOnce();
  expect(op).toHaveBeenCalledWith('unknown', undefined);
});

test('global default operator with arguments', () => {
  const op = vi.fn();
  registerExecutor(op);
  expect(() => createExecutor('unknown', { foo: 'bar' })()).not.toThrow();
  expect(op).toHaveBeenCalledOnce();
  expect(op).toHaveBeenCalledWith('unknown', { foo: 'bar' });
});

test('operation default operator', () => {
  const a = vi.fn();
  registerExecutor('a', a);
  expect(() => createExecutor('b')()).toThrow();
  expect(() => createExecutor('a')()).not.toThrow();
  expect(a).toHaveBeenCalledOnce();
  expect(a).toHaveBeenCalledWith('a', undefined);
});

test('operation default operator with arguments', () => {
  const a = vi.fn();
  registerExecutor('a', a);
  expect(() => createExecutor('b', { foo: 'bar' })()).toThrow();
  expect(() => createExecutor('a', { foo: 'bar' })()).not.toThrow();
  expect(a).toHaveBeenCalledOnce();
  expect(a).toHaveBeenCalledWith('a', { foo: 'bar' });
});

test('structural argument matching', () => {
  const id = 'x';
  const a = vi.fn();
  const b = vi.fn();
  const c = vi.fn();
  registerExecutor(id, { y: 1 }, a);
  registerExecutor(id, { y: 2 }, b);
  registerExecutor(id, { y: 1, z: 1 }, c);
  expect(() => createExecutor(id, { y: 3 })()).toThrow(
    'No executor found for: x:{"y":3} Candidates: x:{"y":1} x:{"y":2} x:{"y":1,"z":1}',
  );
  expect(() => createExecutor(id, { y: 1, z: 1 })()).not.toThrow();
  expect(() => createExecutor(id, { y: 1 })()).not.toThrow();
  expect(() => createExecutor(id, { y: 2 })()).not.toThrow();

  expect(a).toHaveBeenCalledOnce();
  expect(a).toHaveBeenCalledWith(id, { y: 1 });
  expect(b).toHaveBeenCalledOnce();
  expect(b).toHaveBeenCalledWith(id, { y: 2 });
  expect(c).toHaveBeenCalledOnce();
  expect(c).toHaveBeenCalledWith(id, { y: 1, z: 1 });
});

test('static data resolution', () => {
  const id = 'x';
  registerExecutor(id, { foo: 'bar' });
  expect(createExecutor(id)).toEqual({ foo: 'bar' });
});

test('static data resolution with arguments', () => {
  const id = 'x';
  registerExecutor(id, { y: 1 }, { foo: 'bar' });
  expect(() => createExecutor(id)).toThrow();
  expect(createExecutor(id, { y: 1 })).toEqual({ foo: 'bar' });
});
