import type {
  LinkType,
  LocationProviderType,
  useLocationType,
} from '@amazeelabs/bridge';
import { useLocation as gatsbyUseLocation } from '@reach/router';
import { Link as GatsbyLink, navigate as gatsbyNavigate } from 'gatsby';
import React, { ComponentProps } from 'react';

export const Link: LinkType &
  Pick<ComponentProps<typeof GatsbyLink>, 'ref'> = ({ href, ...props }) => {
  return <GatsbyLink to={href || '/'} {...props} />;
};

export const useLocation: useLocationType = () => {
  return [new URL(gatsbyUseLocation().href), gatsbyNavigate];
};

export const LocationProvider: LocationProviderType = ({ children }) => {
  return <>{children}</>;
};
