import { GatsbyBrowser, Link, navigate } from 'gatsby';
import React from 'react';

import { DependencyProvider } from './dependencies';

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
}) => (
  <DependencyProvider
    dependencies={{
      Link: Link,
      navigate,
    }}
  >
    {element}
  </DependencyProvider>
);
