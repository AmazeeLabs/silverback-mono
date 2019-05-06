module.exports = {
  plugins: {
    'postcss-easy-import': {},
    'postcss-preset-env': {
      stage: 0,
    },
    'postcss-url': {
      url: 'inline',
    },
    'postcss-nested': {},
    'postcss-mixins': {},
  },
  module: true,
  url: false,
};
