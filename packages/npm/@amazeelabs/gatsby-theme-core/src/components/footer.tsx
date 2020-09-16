import React from 'react';

import { useSiteMetadata } from '../hooks/use-site-metadata';

export const Footer: React.FC = () => {
  const site = useSiteMetadata();

  return (
    <footer>
      © {new Date().getFullYear()}, {site.author}.
    </footer>
  );
};
