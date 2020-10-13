import NotFound from '@pages/404';
import React from 'react';

import { DataDependencyWrapper } from '../gatsby-api';

const NotFoundPage = () => (
  <DataDependencyWrapper>
    <NotFound />
  </DataDependencyWrapper>
);
export default NotFoundPage;
