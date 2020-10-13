import {
  DataDependencyProvider,
  FrameworkDependencyProvider,
  Link,
} from '@dependencies';
import { GatsbyBrowser, Link as GatsbyLink, navigate } from 'gatsby';
import React from 'react';

import { processNavigationItems } from './hooks/navigation';
import { useNavigationQuery } from './hooks/queries/useNavigationQuery';

const LocalLink: Link = (props) => <GatsbyLink {...props} />;

// TODO: Move tho common theme.
export const GatsbyDependencyWrapper: React.FC = ({ children }) => (
  <FrameworkDependencyProvider
    dependencies={{
      Link: LocalLink,
      navigate,
      SEO: () => null,
    }}
  >
    {children}
  </FrameworkDependencyProvider>
);

export const DataDependencyWrapper: React.FC = ({ children }) => (
  <DataDependencyProvider
    dependencies={{
      useNavigation: () => processNavigationItems(useNavigationQuery()),
    }}
  >
    {children}
  </DataDependencyProvider>
);

export const WrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
}) => <GatsbyDependencyWrapper>{element}</GatsbyDependencyWrapper>;
