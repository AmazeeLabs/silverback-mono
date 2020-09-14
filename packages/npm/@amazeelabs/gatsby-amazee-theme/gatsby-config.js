module.exports = ({ postCssPlugins = [], cssLoaderOptions = {} }) => ({
  plugins: [
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [
          // Apply tailwind features.
          require('tailwindcss')(),
          // Add vendor prefixes.
          require('autoprefixer'),
          ...postCssPlugins,
        ],
        cssLoaderOptions: {
          ...cssLoaderOptions,
        },
      },
    },
  ],
});
