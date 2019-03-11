const path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: './scripts.ts',
  output: {
    filename: 'scripts.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: { extensions: ['.ts', '.js'] },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles.css",
      path: path.resolve(__dirname, 'dist')
    })
  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
        ]
      },
      {
        test: /\.twig$/,
        use: [
          {
            loader: 'twig-loader',
            options: {
              twigOptions: {
                namespaces: {
                  storybook: 'stories'
                }
              }
            }
          }
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
          }
        ],
      }
    ]
  }
};
