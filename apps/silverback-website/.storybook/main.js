// TODO: Move into preset and shared tsconfig.
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: async (config, { configType }) => {
    config.module.rules = config.module.rules.filter(
      (rule) => rule.test !== /\.css$/,
    );
    // Compile tailwind on the fly.
    config.module.rules.push({
      test: /\.pcss$/,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    });
    config.resolve.plugins = [new TsconfigPathsPlugin()];
    return config;
  },
};
