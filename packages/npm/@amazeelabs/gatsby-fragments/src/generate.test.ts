import { readFileSync } from 'fs';
import { sync } from 'glob';

import { generate } from './generate';

describe('generate', () => {
  const filesAmountEquality = () => sync('./test/*.gql').length === sync('./test/*.ts').length;

  const typeScriptFilesContains = (pattern:string) => {
    const files = sync('./test/*.ts');
    let result = true;
    for (const filePath of files) {
      const content = readFileSync(filePath, {encoding: 'utf-8'});
      result = content.includes(pattern);
    }
    return result;
  };

  it('fails if the directory does not exist', () => {
    expect(() => generate({ path: '/idontexist' })).toThrow(
      'Directory "/idontexist" does not exist.',
    );
  });

  generate({ path: './test' });

  it('same amount of source and generated files', () => {
    expect(filesAmountEquality()).toBe(true)
  });

  it('all typescript fragments contains original typename', () => {
    expect(typeScriptFilesContains('__typename:_original_typename')).toBe(true)
  });

  it('all typescript fragments contains Drupal prefix', () => {
    expect(typeScriptFilesContains('on Drupal')).toBe(true)
  });
});
