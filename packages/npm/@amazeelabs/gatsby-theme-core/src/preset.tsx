export const webpackFinal = (config: {
  module: {
    rules: {
      include: RegExp;
      test: RegExp;
      use: any[];
    }[];
  };
  resolve: {
    plugins: object[];
  };
}) => {
  // Transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
  // https://www.gatsbyjs.org/docs/visual-testing-with-storybook/
  config.module.rules.push({
    test: /\.js$/,
    include: /node_modules\/gatsby/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            require.resolve('@babel/preset-react'),
            require.resolve('@babel/preset-env'),
          ],
          plugins: [
            require.resolve('@babel/plugin-proposal-class-properties'),
            require.resolve('babel-plugin-remove-graphql-queries'),
          ],
        },
      },
    ],
  });

  return config;
};

export const addons = ['@storybook/addon-links'];
