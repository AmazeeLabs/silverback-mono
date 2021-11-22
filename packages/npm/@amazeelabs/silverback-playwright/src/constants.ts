import { TestType } from './types';

export const testTypes = [
  'drupal-only',
  'gatsby-develop',
  'gatsby-build',
] as const;

export const tags: Record<TestType, string> = {
  'drupal-only': '@drupal-only',
  'gatsby-develop': '@gatsby-develop|@gatsby-both',
  'gatsby-build': '@gatsby-build|@gatsby-both',
} as const;

export const spServeLogFile = '/tmp/sp-serve.log';
export const spServeDrupalLogFile = '/tmp/sp-serve-drupal.log';
export const spServeGatsbyLogFile = '/tmp/sp-serve-gatsby.log';
export const spTestsDir = 'playwright-tests';

export const drupalPort = 8888;

export const gatsbyDevelopPort = 8000;
export const gatsbyBuildPort = 9000;
export const gatsbyRebuildPort = 9001;

export const spServePort = 9111;
export const spServeBaseUrl = `http://localhost:${spServePort}`;
