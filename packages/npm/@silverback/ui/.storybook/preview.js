import '../tailwind.css';
import { addDecorator } from '@storybook/react';
import { dataMocks } from '../src/components/mocks';
import { DataDependencyProvider } from '../src/components/dependencies';
import { decorators } from '@amazeelabs/gatsby-theme-core/decorators';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

decorators.forEach(addDecorator);

addDecorator((fn, c) => (
  <DataDependencyProvider dependencies={dataMocks}>
    {fn(c)}
  </DataDependencyProvider>
));
