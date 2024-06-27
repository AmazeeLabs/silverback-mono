import {
  AnyOperationId,
  OperationVariables,
} from '@amazeelabs/codegen-operation-ids';
import { cache } from 'react';

import type {
  Operation as ComponentType,
  OperationExecutorsProvider as ProviderType,
  useOperationExecutor as HookType,
} from './interface.js';
import { ExecutorRegistryError, findExecutor, mergeExecutors } from './lib.js';
import type { OperationProps, RegistryEntry } from './types.js';

function serverContext<T>(defaultValue: T): [() => T, (v: T) => void] {
  const getRef = cache(() => ({ current: defaultValue }));

  const getValue = (): T => getRef().current;

  const setValue = (value: T) => {
    getRef().current = value;
  };

  return [getValue, setValue];
}

const [getRegistry, setRegistry] = serverContext<
  RegistryEntry<AnyOperationId>[]
>([]);

export const OperationExecutorsProvider: ProviderType = ({
  children,
  executors,
}) => {
  const registry = getRegistry();
  if (registry.length) {
    throw new Error(
      'OperationExecutor can only be used once in a server context.',
    );
  }
  setRegistry(mergeExecutors(registry, executors));
  return <>{children}</>;
};

export const useOperationExecutor: HookType = <
  TOperation extends AnyOperationId,
>(
  id: TOperation,
  variables: OperationVariables<TOperation>,
) => {
  const op = findExecutor(getRegistry(), id, variables);
  if (op) {
    if (typeof op.executor === 'function') {
      return (vars) => op.executor(id, vars);
    }
    return op.executor;
  }
  throw new ExecutorRegistryError(getRegistry(), id, variables);
};

type Promisify<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

type ServerComponentType = Promisify<ComponentType>;

export const Operation: ComponentType = (async <
  TOperation extends AnyOperationId,
>({
  id,
  variables,
  children,
}: OperationProps<TOperation>) => {
  try {
    const executor = useOperationExecutor(id, variables);
    if (executor instanceof Function) {
      return (
        <>{children({ state: 'success', data: await executor(variables) })}</>
      );
    }
    return <>{children({ state: 'success', data: executor })}</>;
  } catch (error) {
    return <>{children({ state: 'error', error })}</>;
  }
}) satisfies ServerComponentType as unknown as ComponentType;
