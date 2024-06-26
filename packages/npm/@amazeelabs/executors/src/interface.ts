import type {
  AnyOperationId,
  OperationVariables,
} from '@amazeelabs/codegen-operation-ids';
import type { PropsWithChildren, ReactNode } from 'react';

import type { ExecutorFunction, OperationProps, RegistryEntry } from './types';

export type Operation = <TOperation extends AnyOperationId>(
  props: undefined extends OperationVariables<TOperation>
    ? Omit<OperationProps<TOperation>, 'variables'>
    : OperationProps<TOperation> & {
        variables: OperationVariables<TOperation>;
      },
) => ReactNode;

export type useOperationExecutor = <TOperation extends AnyOperationId>(
  id: TOperation,
  variables?: OperationVariables<TOperation>,
) => ExecutorFunction<TOperation>;

export type OperationExecutorsProvider = (
  props: PropsWithChildren<{ executors: Array<RegistryEntry<AnyOperationId>> }>,
) => ReactNode;
