import * as diff from 'diff';
import fs from 'fs-extra';
import prompts, { PromptObject } from 'prompts';

export async function patchFile(file: string, patch: string) {
  const original = (await fs.readFile(file)).toString();
  const patched = diff.applyPatch(original, patch);
  const sep = [...new Array(20)].map(() => '~').join('');
  if (patched) {
    await fs.writeFile(file, patched);
  } else {
    throw new Error(
      `\n\nFailed to apply patch to ${file}:\n${sep} file  ${sep}\n${original}\n${sep} patch ${sep}\n${patch}\n${sep}${sep}~~~~~~\n\n`,
    );
  }
}

export async function prompt(variable: string, prompt: PromptObject) {
  if (typeof process.env[variable] === 'string') {
    if (prompt.validate) {
      const error = await prompt.validate(
        undefined,
        [process.env[variable]],
        prompt,
      );
      if (typeof error === 'string') {
        throw new Error(error);
      }
    }
    return process.env[variable];
  }
  process.env[variable] = (
    await prompts<string>({ ...prompt, name: 'value' })
  ).value;
}
