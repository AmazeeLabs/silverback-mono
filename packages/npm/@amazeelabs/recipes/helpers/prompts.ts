import { loopWhile } from 'deasync';
import originalPrompts from 'prompts';

import { RecipeError } from './errors';
import { log } from './logger';

const inputs: { [key: string]: any } = {};

export const promptInputs = () => inputs;

export function prompts<T extends string = string>(
  questions:
    | originalPrompts.PromptObject<T>
    | Array<originalPrompts.PromptObject<T>>,
  options?: originalPrompts.Options,
): originalPrompts.Answers<T> {
  let done = false;
  let value: originalPrompts.Answers<T> | undefined = undefined;
  originalPrompts(questions, options)
    .then((response) => {
      value = response;
      done = true;
      return response;
    })
    .catch(() => {
      done = true;
    });
  loopWhile(() => !done);
  log.debug(`received input:`, value);
  Object.assign(inputs, value);
  if (value) {
    return value;
  }
  throw new RecipeError('Prompt did not receive a response');
}
