import { AbilityFactory } from './actor';
import { createQuestion, QuestionProcedure } from './question';
import { createTask, TaskProcedure } from './task';

/**
 * Cypress ability base class.
 */
export class UseCypress implements AbilityFactory<Cypress.Chainable<any>> {
  create() {
    return cy;
  }
}

export function createCypressTask<P>(procedure: TaskProcedure<UseCypress, P>) {
  return createTask<UseCypress, P>(UseCypress, procedure);
}

export function createCypressQuestion<P, R>(
  procedure: QuestionProcedure<UseCypress, P, R>,
) {
  return createQuestion<UseCypress, P, R>(UseCypress, procedure);
}
