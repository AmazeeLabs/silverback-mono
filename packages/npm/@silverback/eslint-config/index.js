module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:promise/recommended",
    // Prettier always goes last.
    "prettier",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "promise",
    "deprecate",
  ],
  rules: {
    "no-unused-vars": ["off"],
    "@typescript-eslint/no-unused-vars": ["error"],
    "deprecate/import": ["error"],
  },
};
