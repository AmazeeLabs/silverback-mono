import { Actor } from './src/actor';
import { UseCypress } from './src/cypress';
import { Question } from './src/question';
import { Task as ScreenPlayTask } from './src/task';

export { Actor, AbilityFactory } from './src/actor';
export * from './src/task';
export * from './src/question';
export { AbilityRequestError, UnsupportedTaskError } from './src/errors';
export * from './src/cypress';

let _actor = new Actor([new UseCypress()]);

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Initiate with a different actor.
       *
       * Allows to set a customized actor with specialised abilities.
       *
       * @param actor
       */
      initiateActor(actor: Actor): Chainable<void>;

      /**
       * Perform a given task.
       *
       * @param task
       *   The task implementation.
       * @param param
       *   The tasks parameter.
       */
      perform<P>(task: ScreenPlayTask<P>, param: P): Chainable<void>;

      /**
       * Ask a question.
       *
       * The questions result will be returned as a chainable.
       *
       * @param question
       *   The question implementation.
       * @param param
       *   Question parameter.
       */
      ask<P, R>(question: Question<P, R>, param: P): Chainable<R>;
    }
  }
}

Cypress.Commands.add('initiateActor', (actor: Actor) => {
  _actor = actor;
});

Cypress.Commands.add(
  'perform',
  (task: ScreenPlayTask<any>, param: any = undefined) => {
    _actor.perform(task, param);
  },
);

Cypress.Commands.add(
  'ask',
  (question: Question<any, any>, param: any = undefined) => {
    return cy.wrap(
      new Cypress.Promise((resolve) => {
        _actor.ask(question, param, resolve);
      }),
    );
  },
);
