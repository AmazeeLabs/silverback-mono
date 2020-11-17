import React from 'react';
import { addDecorator } from '@storybook/react';
import '../src/assets/tailwind.css';
import { dataMocks } from '../src/components/mocks';
import { DataDependencyProvider } from '../src/components/dependencies';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

addDecorator((fn, c) => (
  <DataDependencyProvider dependencies={dataMocks}>
    {fn(c)}
  </DataDependencyProvider>
));
