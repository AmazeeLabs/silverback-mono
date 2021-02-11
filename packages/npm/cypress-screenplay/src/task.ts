import { Actor } from './actor';

/**
 * Type definition for task interactions.
 */
export interface TaskInteraction<P> {
  invoke(param: P): void;
}

/**
 * Type definition for tasks.
 *
 * An task is a list of interactions that accept a parameter of type P and don't
 * yield a result, but modify the state as a side effect.
 */
type TaskType<P> = { new (actor: Actor): TaskInteraction<P> };
export type Task<P> = TaskType<P> | TaskType<P>[];
export type TaskProcedure<A extends object, P> = (ability: A, param: P) => void;

/**
 * Shorthand for creating tasks using a specific ability.
 *
 * @param ability
 *   A constructor for an ability service.
 * @param procedure
 *   The procedure to fulfill this task.
 */
export function createTask<A extends object, P>(
  ability: { new (): A },
  procedure: TaskProcedure<A, P>,
) {
  return class implements TaskInteraction<P> {
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
      console.log(this.ability);
    }
    invoke(param: P): void {
      if (this.ability) {
        procedure(this.ability, param);
      }
    }
  };
}
