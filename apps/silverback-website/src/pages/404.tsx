import React from 'react';

import { DataDependencyWrapper } from '../gatsby-api';
import NotFound from "../components/4-pages/404";

const NotFoundPage = () => (
  <DataDependencyWrapper>
    <NotFound />
  </DataDependencyWrapper>
);
export default NotFoundPage;
