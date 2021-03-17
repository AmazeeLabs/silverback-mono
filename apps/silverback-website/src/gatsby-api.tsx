import React from 'react';
import { DataDependencyProvider } from './components/dependencies';

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
