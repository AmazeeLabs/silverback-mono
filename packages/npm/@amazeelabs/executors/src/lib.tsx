import { isMatch } from 'lodash-es';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

type Executor =
  | any
  | ((id: string, variables: Record<string, any>) => any | Promise<any>);

type VariablesMatcher =
  | Record<string, any>
  | ((vars: Record<string, any>) => boolean);

type RegistryEntry = {
  executor: Executor;
  id?: string;
  variables?: VariablesMatcher;
};

const ExecutorsContext = createContext<{
  executors: RegistryEntry[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addExecutors: (executors: RegistryEntry[]) => void;
}>({
  executors: [],
  addExecutors: () => {},
});

export function useExecutor(id: string, variables?: Record<string, any>) {
  const { executors } = useContext(ExecutorsContext);
  const op = getCandidates(id, executors)
    .filter((entry) => matchVariables(entry.variables, variables))
    .pop();

  if (op) {
    if (typeof op.executor === 'function') {
      return (vars?: Record<string, any>) => op.executor(id, vars);
    }
    return op.executor;
  }
  throw new ExecutorRegistryError(executors, id, variables);
}

export function OperationExecutor({
  children,
  ...entry
}: PropsWithChildren<RegistryEntry>) {
  const upstream = useContext(ExecutorsContext).executors;
  const [executors, setExecutors] = useState<RegistryEntry[]>([
    ...upstream,
    entry,
  ]);
  return (
    <ExecutorsContext.Provider
      value={{
        executors,
        addExecutors: (newExecutors) =>
          setExecutors([...executors, ...newExecutors]),
      }}
    >
      {children}
    </ExecutorsContext.Provider>
  );
}

function matchVariables(matcher: VariablesMatcher | undefined, variables: any) {
  if (typeof matcher === 'undefined') {
    return true;
  }
  if (typeof matcher === 'function') {
    return matcher(variables);
  }
  return isMatch(variables, matcher);
}

function getCandidates(id: string, registry: RegistryEntry[]) {
  return (registry as Array<RegistryEntry>).filter(
    (entry) => id === entry.id || entry.id === undefined,
  );
}

function formatEntry(id: string | undefined, variables?: Record<string, any>) {
  return `${id ? id : '*'}:${variables ? JSON.stringify(variables) : '*'}`;
}

class ExecutorRegistryError extends Error {
  constructor(
    registry: RegistryEntry[],
    id: string,
    variables?: Record<string, any>,
  ) {
    const candidates = getCandidates(id, registry);
    const candidatesMessage =
      candidates.length > 0
        ? [
            'Candidates:',
            ...candidates.map(({ id, variables }) =>
              formatEntry(id, variables),
            ),
          ]
        : [];
    super(
      [
        'No executor found for:',
        formatEntry(id, variables),
        ...candidatesMessage,
      ].join(' '),
    );
    this.name = 'ExecutorRegistryError';
  }
}
