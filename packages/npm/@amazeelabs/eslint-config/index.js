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
  plugins: ["@typescript-eslint", "promise", "deprecate", "simple-import-sort", "import"],
  rules: {
    "no-unused-vars": ["off"],
    "@typescript-eslint/no-unused-vars-experimental": ["error"],
    "deprecate/import": ["error"],
    "simple-import-sort/imports": "error",
    "sort-imports": "off",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error"
  },
};
