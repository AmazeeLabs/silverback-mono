const fs = require('fs');
const moduleNameMapper = {
  '\\.(css|less|scss|sss|styl)$': 'identity-obj-proxy',
};

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
      displayName: 'storybook',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: [ "**/.storyshots.tsx" ],
      moduleNameMapper,
      transform: {
        '^.+\\.stories\\.jsx?$': '@storybook/addon-storyshots/injectFileName',
      },
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/**/*.{ts,tsx,js,jsx}'],
    },
  ],
};
