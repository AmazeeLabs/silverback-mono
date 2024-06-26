import { isMatch } from 'lodash-es';

import { RegistryEntry } from './types.js';

type VariablesMatcher =
  | Record<string, any>
  | ((vars: Record<string, any>) => boolean);

export function mergeExecutors(
  oldExecutors: RegistryEntry[],
  newExecutors: RegistryEntry[],
): RegistryEntry[] {
  return [...oldExecutors, ...newExecutors];
}

export function findExecutor(
  executors: RegistryEntry[],
  id: string,
  variables: any,
) {
  const op = getCandidates(id, executors)
    .filter((entry) => matchVariables(entry.variables, variables))
    .pop();
  if (!op) {
    throw new ExecutorRegistryError(executors, id, variables);
  }
  return op;
}

export function matchVariables(
  matcher: VariablesMatcher | undefined,
  variables: any,
) {
  if (typeof matcher === 'undefined') {
    return true;
  }
  if (typeof matcher === 'function') {
    return matcher(variables);
  }
  return isMatch(variables, matcher);
}

export function getCandidates(id: string, registry: RegistryEntry[]) {
  return (registry as Array<RegistryEntry>).filter(
    (entry) => id === entry.id || entry.id === undefined,
  );
}

function formatEntry(id: string | undefined, variables?: unknown) {
  return `${id ? id : '*'}:${variables ? JSON.stringify(variables) : '*'}`;
}

export class ExecutorRegistryError extends Error {
  constructor(registry: RegistryEntry[], id: string, variables?: unknown) {
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
