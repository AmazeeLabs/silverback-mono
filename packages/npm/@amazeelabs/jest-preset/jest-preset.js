const moduleNameMapper = {
  "\\.(css|less|scss|sss|styl)$": "identity-obj-proxy",
};

const projects = [
  {
    displayName: "unit",
    preset: "ts-jest",
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
    preset: "ts-jest",
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
