import {
  Given as given,
  Then as then,
  When as when,
} from 'cypress-cucumber-preprocessor/steps';

import { Actor } from './src/actor';
import { UseCypress } from './src/cypress';
import { Question } from './src/question';
import { Task as ScreenPlayTask } from './src/task';

export { Actor, AbilityFactory } from './src/actor';
export * from './src/task';
export * from './src/question';
export { AbilityRequestError, UnsupportedTaskError } from './src/errors';
export * from './src/cypress';

let _past = new Actor([new UseCypress()]);
let _present = new Actor([new UseCypress()]);
let _future = new Actor([new UseCypress()]);
let _actor = _present;

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Initiate with a different actor.
       *
       * Allows to set a customized actor with specialised abilities.
       *
       * @param actor
       *   An actor that will be used for all interactions.
       */
      initiateActor(actor: Actor): Chainable<void>;

      /**
       * Initiate with a past and a present actor.
       *
       * Set specific actors for past, present or future gherkin steps.
       *
       * @param past
       *   An actor that will be used for past interactions (Given steps)
       * @param present
       *   An actor that will be used for present and future interactions (When/Then steps)
       */
      initiateActor(past: Actor, present: Actor): Chainable<void>;

      /**
       * Initiate with past, preset and future actors.
       *
       * Set specific actors for past, present or future gherkin steps.
       *
       * @param past
       *   An actor that will be used for past interactions (Given steps)
       * @param present
       *   An actor that will be used for present interactions (When steps)
       * @param future
       *   An actor that will be used for future interactions (Then steps)
       */
      initiateActor(
        past: Actor,
        present: Actor,
        future: Actor,
      ): Chainable<void>;

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

Cypress.Commands.add('initiateActor', (...actors: Actor[]) => {
  if (actors.length === 1) {
    [_past = (_present = _future)] = actors;
  }
  if (actors.length === 2) {
    [_past, _present = _future] = actors;
  }
  if (actors.length > 2) {
    [_past, _present, _future] = actors;
  }
  _actor = _present;
});

type StepDefinition = (
  expression: RegExp | string,
  implementation: (...args: string[]) => void,
) => void;

export const Given: StepDefinition = (expression, implementation) => {
  given(expression, (...args) => {
    _actor = _past;
    implementation(...args);
  });
};

export const When: StepDefinition = (expression, implementation) => {
  when(expression, (...args) => {
    _actor = _present;
    implementation(...args);
  });
};

export const Then: StepDefinition = (expression, implementation) => {
  then(expression, (...args) => {
    _actor = _future;
    implementation(...args);
  });
};

Cypress.Commands.add(
  'perform',
  // @ts-ignore Suppress the following:
  // Argument of type '(task: ScreenPlayTask<any>, param?: any) => Cypress.Chainable<Promise<Actor>>' is not assignable to parameter of type 'CommandFn<"perform">'.
  //   Type 'Chainable<Promise<Actor>>' is not assignable to type 'void | Chainable<void>'.
  //     Type 'Chainable<Promise<Actor>>' is not assignable to type 'Chainable<void>'.
  //       Type 'Promise<Actor>' is not assignable to type 'void'.
  (task: ScreenPlayTask<any>, param: any = undefined) => {
    return cy.wrap(_actor.perform(task, param), { log: false });
  },
);

Cypress.Commands.add(
  'ask',
  (question: Question<any, any>, param: any = undefined) => {
    return cy.wrap(
      new Cypress.Promise((resolve) => {
        _actor.ask(question, param, resolve);
      }),
      { log: false },
    );
  },
);
