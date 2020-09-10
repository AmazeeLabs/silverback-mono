module.exports = {
  siteMetadata: {
    title: 'Silverback Website',
    description: 'Silverback website and documentation',
    author: '@amazeelabs',
  },
  plugins: [
    'gatsby-plugin-typescript',
    'gatsby-plugin-typescript-checker',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
  ],
}
