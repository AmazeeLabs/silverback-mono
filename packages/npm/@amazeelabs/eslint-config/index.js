const fs = require('fs');
let isReactProject = false

if (fs.existsSync('./package.json')) {
  const contents = JSON.parse(fs.readFileSync('./package.json').toString());
  isReactProject = !!(contents && (
    (contents.dependencies && contents.dependencies.react) ||
    (contents.devDependencies && contents.devDependencies.react) ||
    (contents.peerDependencies && contents.peerDependencies.react)
  ));
}

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
    ...(isReactProject ? ['plugin:react/recommended'] : []),
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
    ecmaFeatures: {
      jsx: isReactProject,
    }
  },
  settings: isReactProject ? {
    react: {
      version: "detect",
    },
  } : {},
  plugins: [
    "@typescript-eslint",
    "promise",
    "deprecate",
    "simple-import-sort",
    "import",
    ...(isReactProject ? [
      "react",
      "react-hooks",
    ] : [])],
  rules: {
    "no-unused-vars": ["off"],
    "@typescript-eslint/no-unused-vars-experimental": ["error"],
    "deprecate/import": ["error"],
    "simple-import-sort/imports": "error",
    "sort-imports": "off",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    ...(isReactProject ? {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": ["off"],
      "react/prefer-stateless-function": ["error"],
    } : {})
  },
};
