module.exports = {
  "stories": ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions"
  ],
  features: {
    previewCsfV3: true,
    interactionsDebugger: true,
  }
}
