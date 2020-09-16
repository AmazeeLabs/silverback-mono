import { Link } from 'gatsby';
import React from 'react';

import { useSiteMetadata } from '../hooks/use-site-metadata';

export const Header: React.FC = () => {
  const site = useSiteMetadata();

  return (
    <header>
      <h1>
        <Link to="/">{site.title}</Link>
      </h1>
    </header>
  );
};
