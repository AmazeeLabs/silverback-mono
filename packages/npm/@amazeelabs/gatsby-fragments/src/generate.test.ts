import { readFileSync } from 'fs';
import { sync } from 'glob';
import mock from 'mock-fs';

import { generate } from './generate';

describe('generate', () => {
  afterEach(() => {
    mock.restore();
  });
  const fragmentsPath = '/fragments';
  const gqlMocks = {
    '/fragments': {
      'ContentArticle.gql': `fragment ContentBlog on ContentBlog {
        __typename
        title
        headerImage {
          ...MediaImage
        }
      }`,
      'ContentPage.gql': `fragment ContentPage on ContentPage {
        __typename
        title
        articleReference {
          ... on ContentArticle {
            title
          }
        }
      }`,
      'MediaImage.gql': `fragment MediaImage on MediaImage {
        __typename
        url
      }`,
    },
  };

  const filesAmountEquality = (path:string) => sync(`${path}/*.gql`).length === sync(`${path}/*.fragment.ts`).length;

  const typeScriptFilesContains = (path: string, pattern:string) => {
    const files = sync(`${path}/*.ts`);
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

  it('same amount of source and generated files', async () => {
    mock(gqlMocks);
    await generate({ path: fragmentsPath });
    expect(filesAmountEquality(fragmentsPath)).toBe(true);
  });

  it('all typescript fragments contains original typename', async () => {
    mock(gqlMocks);
    await generate({ path: fragmentsPath });
    expect(typeScriptFilesContains(fragmentsPath, '__typename:_original_typename')).toBe(true);
  });

  it('all typescript fragments contains Drupal prefix', async () => {
    mock(gqlMocks);
    await generate({ path: fragmentsPath });
    expect(typeScriptFilesContains(fragmentsPath, 'on Drupal')).toBe(true);
  });
});
