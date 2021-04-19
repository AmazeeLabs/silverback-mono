import fs from 'fs';
import mock from 'mock-fs';

import { RecipeError } from '../errors';
import { readJsonFile, writeJsonFile } from '../files';

beforeEach(mock.restore);

describe('readJsonFile', () => {
  it('throws a recipe error if the file does not exist', () => {
    mock({
      test: {},
    });
    expect(() => readJsonFile('test/test.json')).toThrow(RecipeError);
  });

  it('returns the contents of a json file', () => {
    mock({
      test: {
        'test.json': JSON.stringify({ foo: 'bar' }),
      },
    });
    expect(readJsonFile('test/test.json')).toEqual({ foo: 'bar' });
  });

  it('throws a recipe error if the json content is invalid', () => {
    mock({
      test: {
        'test.json': '{ foo',
      },
    });
    expect(() => readJsonFile('test/test.json')).toThrow(RecipeError);
  });
});

describe('writeJsonFile', () => {
  it('pretty-prints json objects', () => {
    mock({
      test: {},
    });
    writeJsonFile('test/test.json', { foo: { bar: 'baz' } });
    expect(fs.readFileSync('test/test.json').toString()).toEqual(`{
  "foo": {
    "bar": "baz"
  }
}`);
  });
});
