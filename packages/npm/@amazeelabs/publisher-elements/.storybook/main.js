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
  staticDirs: ['./static'],
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
};

