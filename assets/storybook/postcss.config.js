module.exports = {
  plugins: {
    'postcss-easy-import': {},
    'postcss-preset-env': {
      stage: 0,
    },
    'postcss-url': {
      url: 'inline',
    },
  },
  module: true,
  url: false,
};
