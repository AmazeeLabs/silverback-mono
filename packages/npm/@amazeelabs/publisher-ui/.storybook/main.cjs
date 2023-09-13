module.exports = {
  core: {
    // Use webpack 5 to be compatible to ESM packages.
    builder: 'webpack5',
  },
  features: {
    // Show the interactions debugger tab.
    interactionsDebugger: true,
    storyStoreV7: true,
  },
  staticDirs: ['../static'],
  stories: ['../src', '../docs'],
  addons: [
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    '@storybook/addon-actions',
    '@storybook/addon-interactions',
    '@storybook/addon-toolbars',
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          // Specifically require postcss installed in the dependencies instead
          // of the builtin, outdated version.
          postcssOptions: {
            config: '.storybook',
          },
          implementation: require('postcss'),
        },
      },
    },
  ],
  framework: '@storybook/react',
  webpackFinal: async (config) => {
    // Make storybook work inside an ESM package.
    // https://github.com/storybookjs/storybook/issues/15335#issuecomment-1134361845
    config.module.rules.push({
      test: /\.(m?js)$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    return config;
  },
};
