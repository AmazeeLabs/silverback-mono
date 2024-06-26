'use client';
import {
  AnyOperationId,
  OperationResult,
  OperationVariables,
} from '@amazeelabs/codegen-operation-ids';
import { createContext, useContext, useEffect, useState } from 'react';

import type {
  Operation as ComponentType,
  OperationExecutorsProvider as ProviderType,
  useOperationExecutor as HookType,
} from './interface.js';
import { findExecutor, mergeExecutors } from './lib.js';
import type {
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
) => {
  const { executors } = useContext(ExecutorsContext);
  const op = findExecutor(executors, id, variables);
  if (typeof op.executor === 'function') {
    return (vars?: OperationVariables<TOperation>) => op.executor(id, vars);
  }
  return op.executor;
};

function StaticOperation<TOperation extends AnyOperationId>({
  children,
  result,
}: Pick<OperationProps<TOperation>, 'children'> & {
  result: OperationResult<TOperation>;
}) {
  return children({ state: 'success', data: result });
}

function DelayedOperation<TOperation extends AnyOperationId>({
  variables,
  children,
  executor,
}: OperationProps<TOperation> & {
  executor: ExecutorFunction<TOperation>;
}) {
  const [state, setState] =
    useState<Parameters<OperationProps<TOperation>['children']>[0]['state']>(
      'loading',
    );

  const [data, setData] = useState<OperationResult<TOperation> | undefined>(
    undefined,
  );

  const [error, setError] = useState<unknown>();

  useEffect(() => {
    executor(variables)
      .then((result) => {
        setData(result);
        setState('success');
        return;
      })
      .catch((error) => {
        setError(error);
        setState('error');
      });
  }, [executor, variables]);

  return children({ state, error, data });
}

export const Operation: ComponentType = <TOperation extends AnyOperationId>({
  id,
  variables,
  children,
}: OperationProps<TOperation>) => {
  const executor = useOperationExecutor(id, variables);
  return executor instanceof Function ? (
    <DelayedOperation id={id} variables={variables} executor={executor}>
      {children}
    </DelayedOperation>
  ) : (
    <StaticOperation result={executor}>{children}</StaticOperation>
  );
};
