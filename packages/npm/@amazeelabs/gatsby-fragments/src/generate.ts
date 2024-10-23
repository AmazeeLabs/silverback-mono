import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { sync } from 'glob';
import path from 'path';

export const defaultFragmentsPath = './src/fragments/commons';

export type Options = {
  path?: string;
  aggregate?: string;
  skip?: boolean;
};

export const generate = (options: Options) => {
  const fragmentsPath = options?.path || defaultFragmentsPath;

  if (!existsSync(fragmentsPath)) {
    throw `Directory "${fragmentsPath}" does not exist.`;
  }

  // Delete files first, as some .gql files may be removed
  // and this will cause Gatsby build errors.
  const generatedFragments = sync(`${fragmentsPath}/**/*.fragment.ts`);
  for (const filePath of generatedFragments) {
    unlinkSync(filePath);
  }

  const files = sync(`${fragmentsPath}/**/*.gql`);
  const aggregate: Array<string> = [];
  for (const filePath of files) {
    const gqlData = readFileSync(filePath, { encoding: 'utf-8' });
    const fileDirectory: string = path.dirname(filePath);
    const gqlFileName: string = path.basename(filePath);
    const tsFileName: string = `${gqlFileName.substring(
      0,
      gqlFileName.lastIndexOf('.'),
    )}.fragment.ts`;
    const tsFilePath: string = path.resolve(fileDirectory, tsFileName);

    let tsData: string = gqlData;
    if (!options.skip) {
      // Use _original_typename for relevant __typename.
      tsData = tsData = tsData.replace(
        /__typename/g,
        '__typename:_original_typename',
      );
      // Prefix with Drupal.
      tsData = tsData.replace(/\son\s(\w+)\s{/g, ' on Drupal$1 {');
    }

    if (options.aggregate) {
      aggregate.push(gqlData);
    } else {
      writeFileSync(
        tsFilePath,
        [
          `import {graphql} from 'gatsby';`,
          `export const fragment = graphql\`${tsData}\`;`,
        ].join('\n'),
      );
    }
  }
  if (options.aggregate) {
    writeFileSync(
      options.aggregate,
      [
        `import {graphql} from 'gatsby';`,
        `export const fragment = graphql\`${aggregate.join('\n')}\`;`,
      ].join('\n'),
    );
  }
};
