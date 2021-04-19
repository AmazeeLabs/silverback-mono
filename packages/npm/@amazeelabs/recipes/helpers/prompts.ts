import { loopWhile } from 'deasync';
import originalPrompts from 'prompts';

import { RecipeError } from './errors';

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
  if (value) {
    return value;
  }
  throw new RecipeError('Prompt did not receive a response');
}
