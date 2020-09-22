import React from 'react';

import { Layout as CustomLayout } from '../../../layout';

export const Layout: React.FC = ({ children, ...props }) => (
  <CustomLayout {...props}>{children}</CustomLayout>
);
