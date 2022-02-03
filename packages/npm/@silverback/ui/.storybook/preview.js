import '../tailwind.css';
export { argTypes } from '@amazeelabs/react-framework-bridge/storybook';
import { ActionsDecorator } from '@amazeelabs/react-framework-bridge/storybook';
export const decorators = [ActionsDecorator];
export const parameters = {
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
  axe: {
    skip: true,
  },
};
