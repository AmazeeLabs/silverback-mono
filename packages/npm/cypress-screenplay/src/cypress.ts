import { createQuestion, QuestionProcedure } from './question';
import { createTask, TaskProcedure } from './task';

/**
 * Cypress ability base class.
 */
export class UseCypress {
  /**
   * A cypress instance.
   */
  protected cypress: Cypress.Chainable;

  constructor() {
    this.cypress = cy;
  }

  /**
   * Retrieve the cypress instance.
   */
  get cy() {
    return this.cypress;
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
