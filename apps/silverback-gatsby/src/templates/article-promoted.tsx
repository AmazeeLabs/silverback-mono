import { Link, PageProps } from 'gatsby';
import React from 'react';

import { StandardLayout } from '../layouts/StandardLayout';
import { LocationState } from '../types/LocationState';

const ArticlePromoted: React.FC<PageProps<unknown, unknown, LocationState>> = ({
  location,
}) => {
  return (
    <StandardLayout locationState={location.state}>
      <div>
        <Link to="/">To frontpage</Link>
      </div>
      This article is promoted
    </StandardLayout>
  );
};

export default ArticlePromoted;
