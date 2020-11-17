import { DataDependencyProvider } from '@dependencies';
import React from 'react';

import { processNavigationItems } from './hooks/navigation';
import { useNavigationQuery } from './hooks/queries/useNavigationQuery';

export const DataDependencyWrapper: React.FC = ({ children }) => (
  <DataDependencyProvider
    dependencies={{
      useNavigation: () => processNavigationItems(useNavigationQuery()),
    }}
  >
    {children}
  </DataDependencyProvider>
);
