import React from 'react';
import { addDecorator } from '@storybook/react';
import '../src/assets/tailwind.css';
import { frameworkMocks, dataMocks } from '../src/components/mocks';
import {
  FrameworkDependencyProvider,
  DataDependencyProvider,
} from '../src/components/dependencies';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

addDecorator((fn, c) => (
  <FrameworkDependencyProvider dependencies={frameworkMocks}>
    <DataDependencyProvider dependencies={dataMocks}>
      {fn(c)}
    </DataDependencyProvider>
  </FrameworkDependencyProvider>
));
