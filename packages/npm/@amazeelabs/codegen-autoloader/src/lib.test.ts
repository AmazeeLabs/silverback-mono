import { expect, describe, it } from 'vitest';
import { buildSchema } from 'graphql';
import {
  extractDocstrings,
  extractImplementations,
  selectImplementation,
  printAutoload,
  generateAutoloader,
} from './lib';

describe('extractDocstrings', () => {
  it('returns an empty dictionary if there are no docstrings', () => {
    expect(
      extractDocstrings(
        buildSchema(`directive @myDirective on FIELD_DEFINITION`),
      ),
    ).toEqual({});
  });
  it('returns a docstring for a directive', () => {
    expect(
      extractDocstrings(
        buildSchema(`
            """
            This is a comment
            """
            directive @myDirective on FIELD_DEFINITION
            directive @anotherDirective on FIELD_DEFINITION
          `),
      ),
    ).toEqual({ myDirective: 'This is a comment' });
  });
});

describe('extractImplementations', () => {
  it('returns an empty dictionary if there are no implementations', () => {
    expect(extractImplementations('')).toEqual({});
  });

  it('ignores empty docstrings', () => {
    expect(
      extractImplementations(['This is some unrelated comment'].join('\n')),
    ).toEqual({});
  });

  it('extracts a single default implementation', () => {
    expect(
      extractImplementations(
        [
          'This is some other comment content',
          '',
          'implementation: @my/package#function',
        ].join('\n'),
      ),
    ).toEqual({ '': { package: '@my/package', export: 'function' } });
  });

  it('prefers the last implementation', () => {
    expect(
      extractImplementations(
        [
          'This is some other comment content',
          '',
          'implementation: @my/package#a',
          'implementation: @my/package#b',
        ].join('\n'),
      ),
    ).toEqual({ '': { package: '@my/package', export: 'b' } });
  });

  it('extracts contextual implementations', () => {
    expect(
      extractImplementations(
        [
          'This is some other comment content',
          '',
          'implementation: @my/package#a',
          'implementation(gatsby): @my/package#b',
        ].join('\n'),
      ),
    ).toEqual({
      '': { package: '@my/package', export: 'a' },
      gatsby: { package: '@my/package', export: 'b' },
    });
  });

  it('prefers the last implementation of a context', () => {
    expect(
      extractImplementations(
        [
          'This is some other comment content',
          '',
          'implementation(gatsby): @my/package#a',
          'implementation(gatsby): @my/package#b',
          'implementation: @my/package#c',
        ].join('\n'),
      ),
    ).toEqual({
      '': { package: '@my/package', export: 'c' },
      gatsby: { package: '@my/package', export: 'b' },
    });
  });
});

describe('selectImplementation', () => {
  it('falls back to the default implementation if the context does not match', () => {
    expect(
      selectImplementation('gatsby')({
        '': { package: '@my/package', export: 'a' },
      }),
    ).toEqual({ package: '@my/package', export: 'a' });
  });

  it('returns the implementation for the context if it exists', () => {
    expect(
      selectImplementation('gatsby')({
        '': { package: '@my/package', export: 'a' },
        gatsby: { package: '@my/package', export: 'b' },
      }),
    ).toEqual({ package: '@my/package', export: 'b' });
  });

  it('returns undefined if there is no default implementation', () => {
    expect(
      selectImplementation('gatsby')({
        nextjs: { package: '@my/package', export: 'b' },
      }),
    ).toEqual(undefined);
  });
});

describe('printAutoload', () => {
  it('prints an empty object if there are no implementations', () => {
    expect(printAutoload({})).toEqual('export default {\n};');
  });

  it('prints a single default implementation', () => {
    expect(
      printAutoload({
        myDirective: { package: '@my/package', export: 'function' },
      }),
    ).toEqual(
      [
        'import { function as al0 } from "@my/package";',
        'export default {',
        '  myDirective: al0,',
        '};',
      ].join('\n'),
    );
  });
});

describe('generateAutoloader', () => {
  it('generates an empty autoloader if there are no directives', () => {
    expect(
      generateAutoloader(
        buildSchema(`type Query { hello: String! }`),
        'gatsby',
      ),
    ).toEqual(`export default {\n};`);
  });

  it('generates an autoloader with a single directive', () => {
    expect(
      generateAutoloader(
        buildSchema(
          [
            '"""',
            'This is a comment',
            '',
            'implementation: @my/package#function',
            '"""',
            'directive @myDirective on FIELD_DEFINITION',
            'directive @whatever on FIELD_DEFINITION',
          ].join('\n'),
        ),
        'gatsby',
      ),
    ).toEqual(
      [
        'import { function as al0 } from "@my/package";',
        'export default {',
        '  myDirective: al0,',
        '};',
      ].join('\n'),
    );
  });

  it('generates an autoloader with multiple directives', () => {
    expect(
      generateAutoloader(
        buildSchema(
          [
            '"""',
            'This is a comment',
            '',
            'implementation: @my/package#a',
            '"""',
            'directive @myDirective on FIELD_DEFINITION',
            '',
            '"""',
            'This is another comment',
            '',
            'implementation: @my/package#b',
            '"""',
            'directive @anotherDirective on FIELD_DEFINITION',
            'directive @whatever on FIELD_DEFINITION',
          ].join('\n'),
        ),
        'gatsby',
      ),
    ).toEqual(
      [
        'import { a as al0 } from "@my/package";',
        'import { b as al1 } from "@my/package";',
        'export default {',
        '  myDirective: al0,',
        '  anotherDirective: al1,',
        '};',
      ].join('\n'),
    );
  });

  it('generates an autoloader with multiple directives and contexts', () => {
    expect(
      generateAutoloader(
        buildSchema(
          [
            '"""',
            'This is a comment',
            '',
            'implementation: @my/package#function',
            '"""',
            'directive @myDirective on FIELD_DEFINITION',
            '',
            '"""',
            'This is another comment',
            '',
            'implementation: @my/package#generic',
            'implementation(gatsby): @my/package#gatsby',
            '"""',
            'directive @anotherDirective on FIELD_DEFINITION',
            '"""',
            'This is a third comment',
            '"""',
            'directive @whatever on FIELD_DEFINITION',
          ].join('\n'),
        ),
        'gatsby',
      ),
    ).toEqual(
      [
        'import { function as al0 } from "@my/package";',
        'import { gatsby as al1 } from "@my/package";',
        'export default {',
        '  myDirective: al0,',
        '  anotherDirective: al1,',
        '};',
      ].join('\n'),
    );
  });
});
