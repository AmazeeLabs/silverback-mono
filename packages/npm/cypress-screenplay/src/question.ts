import { AbilityType, Actor, isAbilityFactory } from './actor';

/**
 * Type definition for question interactions.
 */
export interface QuestionInteraction<P, R> {
  invoke(param: P, assert: (answer: R) => void): void;
}

/**
 * Type definition for questions.
 *
 * An question is a list of interactions that accept a parameter of type P and
 * and accept an assertion callback of type R.
 */
type QuestionType<P, R> = { new (actor: Actor): QuestionInteraction<P, R> };
export type Question<P, R> = QuestionType<P, R> | QuestionType<P, R>[];
export type QuestionProcedure<A extends object, P, R> = (
  ability: AbilityType<A>,
  param: P,
  assert: (answer: R) => void,
) => void;

/**
 * Shorthand for creating questions using a specific ability.
 *
 * @param ability
 *   A constructor for an ability service.
 * @param procedure
 *   The procedure to answer this question.
 */
export function createQuestion<A extends object, P, R>(
  ability: { new (): A },
  procedure: QuestionProcedure<A, P, R>,
) {
  return class implements QuestionInteraction<P, R> {
    /**
     * A ability service object to invoke commands on.
     */
    public ability?: A;

    /**
     * An actor to perform sub-tasks.
     */
    public actor?: Actor;

    constructor(actor: Actor) {
      this.actor = actor;
      this.ability = actor.ability(ability);
    }
    invoke(param: P, assert: (answer: R) => void): void {
      if (this.ability) {
        procedure(
          isAbilityFactory(this.ability) ? this.ability.create() : this.ability,
          param,
          assert,
        );
      }
    }
  };
}
