export default {
  title: "Silverback",
  description: "Silverback documentation.",
  typescript: true,
  gatsbyRemarkPlugins: [
    {
      resolve: "gatsby-remark-vscode",
      options: {
        languageAliases: {
          gherkin: "shell",
        },
      },
    },
  ],
};
