module.exports = {
  title: 'Silverback',
  description: 'Silverback documentation.',
  base: '/silverback/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Development', link: '/development/' },
      { text: 'Features', link: '/features/' },
    ],
    sidebarDepth: 2,
    sidebar: 'auto',
    displayAllHeaders: true
  },
  markdown: {
    lineNumbers: true
  }
};
