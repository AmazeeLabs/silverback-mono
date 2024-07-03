'use client';
import {
  AnyOperationId,
  OperationVariables,
} from '@amazeelabs/codegen-operation-ids';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import type {
  Operation as ComponentType,
  OperationExecutorsProvider as ProviderType,
  useAllOperationExecutors as AllHookType,
  useOperationExecutor as HookType,
} from './interface.js';
import { findExecutor, findExecutors, mergeExecutors } from './lib.js';
import type {
  ExecutionState,
  ExecutorFunction,
  OperationProps,
  RegistryEntry,
} from './types.js';

const ExecutorsContext = createContext<{
  executors: RegistryEntry[];
}>({
  executors: [],
});

export const OperationExecutorsProvider: ProviderType = ({
  children,
  executors,
}) => {
  const upstream = useContext(ExecutorsContext).executors;
  const merged = mergeExecutors(upstream, executors);
  return (
    <ExecutorsContext.Provider
      value={{
        executors: merged,
      }}
    >
      {children}
    </ExecutorsContext.Provider>
  );
};

export const useOperationExecutor: HookType = <
  TOperation extends AnyOperationId,
>(
  id: TOperation,
  variables?: OperationVariables<TOperation>,
): ExecutorFunction<TOperation> => {
  const { executors } = useContext(ExecutorsContext);
  const executor = findExecutor(executors, id, variables);
  if (executor instanceof Function) {
    return (vars?: OperationVariables<TOperation>) => executor(id, vars);
  }
  return () => executor;
};

export const useAllOperationExecutors: AllHookType = <
  TOperation extends AnyOperationId,
>(
  id: TOperation,
  variables?: OperationVariables<TOperation>,
) => {
  const { executors } = useContext(ExecutorsContext);
  return findExecutors(executors, id, variables).map((exec) =>
    exec instanceof Function ? (vars) => exec(id, vars) : () => exec,
  );
};

function DelayedOperation<T extends any>({
  children,
  operation,
}: {
  children: (props: ExecutionState<T>) => ReactNode;
  operation: () => Promise<T>;
}) {
  const [state, setState] = useState<ExecutionState<T>['state']>('loading');

  const [data, setData] = useState<T | undefined>(undefined);

  const [error, setError] = useState<unknown>();

  useEffect(() => {
    operation()
      .then((result) => {
        setData(result);
        setState('success');
        return;
      })
      .catch((error) => {
        setError(error);
        setState('error');
      });
  }, [operation]);

  return <>{children({ state, error, data: data! })}</>;
}

function SingleOperation<TOperation extends AnyOperationId>(
  props: Omit<OperationProps<TOperation, false>, 'all'>,
) {
  const registry = useContext(ExecutorsContext).executors;
  const executor = findExecutor(registry, props.id, props.variables);
  if (!(executor instanceof Function)) {
    return props.children({ state: 'success', data: executor });
  }
  return (
    <DelayedOperation
      {...props}
      operation={() => executor(props.id, props.variables)}
    />
  );
}

function MultiOperation<TOperation extends AnyOperationId>(
  props: Omit<OperationProps<TOperation, true>, 'all'>,
) {
  const registry = useContext(ExecutorsContext).executors;
  const executors = findExecutors(registry, props.id, props.variables);

  if (executors.every((exec) => !(exec instanceof Function))) {
    return props.children({ state: 'success', data: executors });
  }
  return (
    <DelayedOperation
      {...props}
      operation={() =>
        Promise.all(
          executors.map((exec) =>
            exec instanceof Function ? exec(props.id, props.variables) : exec,
          ),
        )
      }
    />
  );
}

export const Operation: ComponentType = <
  TOperation extends AnyOperationId,
  TAll extends boolean,
>({
  all,
  ...props
}: OperationProps<TOperation, TAll>) => {
  // @ts-ignore: Not sure how to fix this, but typing works from the outside.
  return all ? <MultiOperation {...props} /> : <SingleOperation {...props} />;
};
