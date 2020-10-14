module.exports = {
  watchPlugins: [
    'jest-watch-select-projects',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  projects: [
    {
      displayName: 'test',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/**/*.{ts,tsx,js,jsx}'],
    },
  ],
};
