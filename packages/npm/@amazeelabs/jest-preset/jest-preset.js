const ignorePaths = [
  '<rootDir>/public',
  '<rootDir>/build',
  '<rootDir>/dist',
  '<rootDir>/storybook-build',
  '<rootDir>/node_modules',
  '<rootDir>/generated',
  '<rootDir>/.cache',
];

module.exports = {
  watchPlugins: [
    'jest-watch-select-projects',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  projects: [
    {
      testPathIgnorePatterns: ignorePaths,
      displayName: 'test',
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
    {
      testPathIgnorePatterns: ignorePaths,
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/**/*.{ts,tsx,js,jsx}'],
    },
  ],
};
