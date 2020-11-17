import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

export const webpackFinal = (config: {
  module: {
    rules: {
      test: RegExp;
      use: string[];
    }[];
  };
  resolve: {
    plugins: object[];
  };
}) => {
  config.resolve.plugins = [new TsconfigPathsPlugin()];
  return config;
};

export function config(entry: any[] = []) {
  return [...entry, require.resolve('./decorators')];
}

export const addons = ['@storybook/addon-links'];
