const moduleNameMapper = {
  "\\.(css|less|scss|sss|styl)$": "identity-obj-proxy",
};

const projects = [
  {
    displayName: "unit",
    transform: {
      '^.+\\.(t|j)sx?$': '@swc/jest',
    },
    testEnvironment: "node",
    testMatch: [
      "**/__tests__/**/*.ts",
      "**/?(*.)+(spec|test).ts",
      "!**/playwright-tests/**",
      "!**/dist/**",
    ],
    moduleNameMapper,
  },
  {
    displayName: "dom",
    transform: {
      '^.+\\.(t|j)sx?$': '@swc/jest',
    },
    testEnvironment: "jsdom",
    testMatch: [
      "**/__tests__/**/*.tsx",
      "**/?(*.)+(spec|test).tsx",
      "!**/playwright-tests/**",
      "!**/dist/**",
    ],
    moduleNameMapper,
  },
];

module.exports = {
  watchPlugins: [
    "jest-watch-select-projects",
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  projects,
};
