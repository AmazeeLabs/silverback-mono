import React from 'react';

import { Header as CustomHeader } from '../../../components';

export const Header: React.FC = ({ children, ...props }) => (
  <CustomHeader {...props}>{children}</CustomHeader>
);
