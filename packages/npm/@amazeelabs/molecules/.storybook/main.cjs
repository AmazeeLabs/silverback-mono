const { mergeConfig } = require('vite');
const { imagetools } = require('vite-imagetools');

module.exports = {
  async viteFinal(config) {
    // return the customized config
    return mergeConfig(config, {
      plugins: [imagetools()],
    });
  },
  stories: [
    '../src/docs/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite',
  },
  features: {
    storyStoreV7: true,
  },
};
