module.exports = {
  extends: ['@amazeelabs/eslint-config'],
  root: true,
  rules: {
    // This rule breaks linting on Linux. We don't need it for this package
    // anyway, so we turn it off.
    'react/no-is-mounted': ['off'],
  },
};
