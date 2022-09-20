import './tailwind.css';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    storySort: ['Introduction', 'Components'],
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
