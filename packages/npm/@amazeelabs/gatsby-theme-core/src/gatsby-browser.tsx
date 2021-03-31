import { GatsbyBrowser, Link, navigate } from 'gatsby';
import { GatsbyImage, StaticImage } from 'gatsby-plugin-image';
import React from 'react';

import { DependencyProvider } from './dependencies';

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
}) => (
  <DependencyProvider
    dependencies={{
      Link,
      navigate,
      GatsbyImage,
      StaticImage,
    }}
  >
    {element}
  </DependencyProvider>
);
