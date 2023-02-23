module.exports = {
  extends: ['@amazeelabs/eslint-config'],
  root: true,
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    'promise/always-return': 'off',
    'promise/catch-or-return': 'off',
  },
};
