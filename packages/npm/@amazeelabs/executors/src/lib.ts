import { isMatch, isString } from 'lodash-es';

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

let registry: Array<any> = [];

export function clearRegistry() {
  registry = [];
}

export function registerExecutor(executor: Executor): void;

export function registerExecutor(id: string, executor: Executor): void;

export function registerExecutor(
  id: string,
  variables: VariablesMatcher,
  executor: Executor,
): void;

export function registerExecutor(...args: unknown[]): void {
  registry.push({
    id: isString(args[0]) ? args[0] : undefined,
    executor: args[args.length - 1],
    variables: args.length === 3 ? args[1] : undefined,
  });
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

function getCandidates(id: string) {
  return (registry as Array<RegistryEntry>).filter(
    (entry) => id === entry.id || entry.id === undefined,
  );
}

function formatEntry(id: string | undefined, variables?: Record<string, any>) {
  return `  ${id ? id : '*'}:${variables ? JSON.stringify(variables) : '*'}`;
}

class ExecutorRegistryError extends Error {
  constructor(id: string, variables?: Record<string, any>) {
    const candidates = getCandidates(id);
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
      ].join('\n'),
    );
    this.name = 'ExecutorRegistryError';
  }
}

/**
 * Create an executor from the registry.
 *
 * @param id
 *   The operation ID, from the schema package.
 * @param variables
 *   A dictionary of variables to be passed to the operation.
 */
export function createExecutor(
  id: string,
  variables?: Record<string, any>,
): () => any | any {
  const op = getCandidates(id)
    .filter((entry) => matchVariables(entry.variables, variables))
    .pop();

  if (op) {
    if (typeof op.executor === 'function') {
      return () => op.executor(id, variables);
    }
    return op.executor;
  }
  throw new ExecutorRegistryError(id, variables);
}
