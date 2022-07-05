import { existsSync, readFileSync, writeFileSync } from 'fs';
import { sync } from 'glob';
import path from 'path';

export const defaultFragmentsPath = './src/fragments/commons';

export type Options = {
  path?: string
};

export const generate = (options:Options) => {
  const fragmentsPath = options?.path || defaultFragmentsPath;

  if (!existsSync(fragmentsPath)) {
    throw `Directory "${fragmentsPath}" does not exist.`;
  }

  const files = sync(`${fragmentsPath}/**/*.gql`);
  for (const filePath of files) {
    const gqlData = readFileSync(filePath, {encoding: 'utf-8'});
    const fileDirectory: string = path.dirname(filePath);
    const gqlFileName: string = path.basename(filePath);
    const tsFileName: string = `${gqlFileName.substring(0, gqlFileName.lastIndexOf('.'))}.fragment.ts`;
    const tsFilePath: string = path.resolve(fileDirectory, tsFileName);

    let tsData: string = gqlData;
    // Use _original_typename for relevant __typename.
    tsData = tsData = tsData.replace(/__typename/g, '__typename:_original_typename');
    // Prefix with Drupal.
    tsData = tsData.replace(/\son\s(\w+)\s{/g, ' on Drupal$1 {');
    tsData = `import { graphql } from 'gatsby';
export const fragment = graphql\`
  ${tsData}
\`;
`;
    writeFileSync(tsFilePath, tsData);
  }
};
