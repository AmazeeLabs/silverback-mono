const path = require('path');

// Import common configurations.
const common = require('../webpack.common');

module.exports = ({ config }) => {
  // Add common plugins.
  config.plugins.push(...common.plugins);

  // Reuse common webpack configuration.
  config.module.rules.push(common.javascript);
  config.module.rules.push(common.assets);
  config.module.rules.push(common.css);

  // Twig webpack is only required within storybook.
  config.module.rules.push({
    test: /\.twig$/,
    use: [
      {
        loader: 'twig-loader',
        options: {
          twigOptions: {
            namespaces: {
              storybook: path.resolve(__dirname, '../', 'twig'),
            },
          },
        },
      },
    ],
  });

  // Support importing typescript files without extension.
  config.resolve.extensions.push('.ts');

  return config;
};
