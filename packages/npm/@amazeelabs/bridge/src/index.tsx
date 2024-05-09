import React, {
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  JSXElementConstructor,
  PropsWithChildren,
} from 'react';

export type LocationType = Pick<
  URL,
  'hash' | 'pathname' | 'search' | 'searchParams'
>;

export type LocationProviderType = JSXElementConstructor<
  PropsWithChildren<{
    currentLocation?: LocationType;
  }>
>;

export type LinkType = JSXElementConstructor<
  Omit<
    DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    'ref'
  >
>;

export type useLocationType = () => [LocationType, (url: string) => void];

export const Link: LinkType = (props) => {
  return <a {...props}>{props.children}</a>;
};

export const LocationProvider: LocationProviderType = ({ children }) => {
  return <>{children}</>;
};

export const useLocation: useLocationType = () => {
  return [
    new URL(window.location.href),
    (to: string) => {
      window.location.href = to;
    },
  ];
};
