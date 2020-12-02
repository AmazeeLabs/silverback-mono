import { addDecorator } from '@storybook/react';

import '../src/assets/tailwind.css';
import { decorators } from '@amazeelabs/gatsby-theme-core/decorators';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

decorators.forEach(addDecorator);
