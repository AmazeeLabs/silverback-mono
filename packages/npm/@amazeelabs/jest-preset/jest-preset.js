const fs = require('fs');
const moduleNameMapper = {
  '\\.(css|less|scss|sss|styl)$': 'identity-obj-proxy',
};

const projects = [
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
];

if (fs.existsSync('./package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('./package.json'));
  const dependencies = Object.keys(Object.assign(packageJson.dependencies || {}, packageJson.devDependencies || {}));
  if(dependencies.includes('@storybook/addon-storyshots')) {
    projects.push({
      displayName: 'storybook',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: [ "**/.storyshots.tsx" ],
      moduleNameMapper,
      transform: {
        '^.+\\.stories\\.jsx?$': '@storybook/addon-storyshots/injectFileName',
      },
    });
  }
}

if (fs.existsSync('./.eslintrc.js')) {
  projects.push({
    displayName: 'lint',
    runner: 'jest-runner-eslint',
    testMatch: ['<rootDir>/**/*.{ts,tsx,js,jsx}'],
  })
}

module.exports = {
  watchPlugins: [
    'jest-watch-select-projects',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  projects,
};
