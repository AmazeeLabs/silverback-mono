const fs = require('fs');
const moduleNameMapper = {};

if (fs.existsSync('./tsconfig.json')) {
  const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json').toString());
  Object.assign(moduleNameMapper, require("tsconfig-paths-jest")(tsconfig));
}

module.exports = {
  watchPlugins: [
    'jest-watch-select-projects',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [ "**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts" ],
      moduleNameMapper,
    },
    {
      displayName: 'dom',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: [ "**/__tests__/**/*.tsx", "**/?(*.)+(spec|test).tsx" ],
      moduleNameMapper,
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/**/*.{ts,tsx,js,jsx}'],
    },
  ],
};
