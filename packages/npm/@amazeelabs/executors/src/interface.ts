import type {
  AnyOperationId,
  OperationVariables,
} from '@amazeelabs/codegen-operation-ids';
import type { PropsWithChildren, ReactElement } from 'react';

import type { ExecutorFunction, OperationProps, RegistryEntry } from './types';

export type { RegistryEntry } from './types';

export type Operation = <
  TOperation extends AnyOperationId,
  TAll extends boolean = false,
>(
  props: undefined extends OperationVariables<TOperation>
    ? Omit<OperationProps<TOperation, TAll>, 'variables'>
    : OperationProps<TOperation, TAll> & {
        variables: OperationVariables<TOperation>;
      },
) => ReactElement;

export type useOperationExecutor = <TOperation extends AnyOperationId>(
  id: TOperation,
  variables?: OperationVariables<TOperation>,
) => ExecutorFunction<TOperation>;

export type useAllOperationExecutors = <TOperation extends AnyOperationId>(
  id: TOperation,
  variables?: OperationVariables<TOperation>,
) => Array<ExecutorFunction<TOperation>>;

export type OperationExecutorsProvider = (
  props: PropsWithChildren<{ executors: Array<RegistryEntry<AnyOperationId>> }>,
) => ReactElement;
