import { readFile, writeFile } from 'fs';
import { glob } from 'glob';
import path from 'path';

export const defaultFragmentsPath = './src/fragments/commons';

export const generate = (options:any) => {
  const typeScriptFragmentsPath = options?.path || defaultFragmentsPath;

  glob(`${typeScriptFragmentsPath}/**/*.gql`, {}, (error, files) => {
    for (const filePath of files) {
      readFile(filePath, {encoding: 'utf-8'}, (error, gqlData) => {
        if (!error) {
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
          writeFile(tsFilePath, tsData, error => {
            if (error) {
              console.error(error);
            }
          });
        } else {
          console.error(error);
        }
      })
    }
  });
};
