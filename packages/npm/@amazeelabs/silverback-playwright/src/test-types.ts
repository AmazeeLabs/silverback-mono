export const testTypes = [
  'drupal-only',
  // 'gatsby-develop',
  'gatsby-build',
] as const;

export type TestType = typeof testTypes[number];

export const tags: Record<TestType, string> = {
  'drupal-only': '@drupal-only',
  // 'gatsby-develop': '@gatsby-develop|@gatsby-both',
  'gatsby-build': '@gatsby-build|@gatsby-both',
} as const;
