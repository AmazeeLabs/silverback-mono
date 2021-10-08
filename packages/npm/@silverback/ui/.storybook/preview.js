import '../tailwind.css';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    storySort: {
      order: [
        'Atoms',
        'Molecules',
        'Organisms',
        'Layouts',
        'Pages'
        ['Atoms', 'Molecules', 'Organisms', 'Pages', 'Layouts'],
      ],
    },
  },
};
