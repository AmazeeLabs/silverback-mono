module.exports = {
  title: 'Silverback',
  description: 'Silverback documentation.',
  base: '/silverback/',
  themeConfig: {
    nav: [
      {text: 'Home', link: '/'},
      {
        text: 'Development', items: [
          {text: 'Setup', link: '/development/setup'},
          {text: 'Workflow', link: '/development/workflow'},
          {text: 'Testing', link: '/development/testing'},
          {text: 'Lagoon', link: '/development/lagoon'},
          {text: 'Webpack', link: '/development/webpack'}
        ]
      },
      {
        text: 'Features',
        items: [
          {text: 'Translations', link: '/features/translations/'},
          {text: 'WYSIWYG Editor', link: '/features/sections/'},
        ]
      },
    ],
    sidebarDepth: 2,
    sidebar: 'auto',
    displayAllHeaders: true,
    repo: 'AmazeeLabs/silverback',
    repoLabel: 'GitHub',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'I found a typo and I don\'t want to keep it!'
  },
  markdown: {
    lineNumbers: true
  }
};
