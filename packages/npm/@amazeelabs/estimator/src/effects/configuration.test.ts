import { beforeEach, describe, expect, it } from 'vitest';

import { configSchema } from '../configschema.js';
import { configuration } from './configuration.js';

const defaultConfig = configSchema.parse({});

beforeEach(() => {
  delete process.env.PROJECT_DIR;
});

describe('configuration', () => {
  it('returns the default configuration if there is no config file', async ({
    repo,
    effectValue,
  }) => {
    const result = await effectValue(configuration);
    expect(result).toEqual({ ...defaultConfig, root: repo.directory });
  });

  it('merges the default configuration with the loaded configuration', async ({
    repo,
    effectValue,
  }) => {
    await repo.write(
      '.estimatorrc.yml',
      'documents: ["schema", "src"]\nweights:\n  directives:\n    beast: 666\n',
    );
    const result = await effectValue(configuration);
    expect(result).not.toEqual(defaultConfig);
    expect(result.documents).toEqual(['schema', 'src']);
    expect(result.weights?.schema['QUERY_FIELD_DEFINITION']).toEqual(
      defaultConfig.weights.schema.QUERY_FIELD_DEFINITION,
    );
    expect(result.weights?.directives.beast).toEqual(666);
    expect(result.weights?.directives.entity).toEqual(6);
    expect(result.root).toEqual(repo.directory);
  });

  it('throws if the configuration is not correct', async ({
    repo,
    effectError,
  }) => {
    await repo.write(
      '.estimatorrc.yml',
      'documents: "foobar"\nweights:\n  directives:\n    beast: "666"\n',
    );
    const result = await effectError(configuration);
    expect(result).toMatch(/Configuration errors:/);
    expect(result).toMatch(
      /Config error at "documents": Expected array, received string/,
    );
    expect(result).toMatch(
      /Config error at "weights.directives.beast": Expected number, received string/,
    );
  });
});
