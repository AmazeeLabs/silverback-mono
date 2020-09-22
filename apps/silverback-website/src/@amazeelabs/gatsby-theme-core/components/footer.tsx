import React from 'react';

import { Footer as CustomFooter } from '../../../components';

export const Footer: React.FC = ({ children, ...props }) => (
  <CustomFooter {...props}>{children}</CustomFooter>
);
