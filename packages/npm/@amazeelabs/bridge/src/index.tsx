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

// Low level context if placeholders should be used for images.
// This is required by @amazeelabs/scalars' Image component, which
// decides to use a placeholder based on this context. In storybook
// this context has to be reactive, since there is a UI button to
// switch placeholders on and off. In Gatsby the implementation is
// static to not compromise performance.
export type ImagePlaceholderProviderType = JSXElementConstructor<
  PropsWithChildren<{
    useImagePlaceholder?: boolean;
  }>
>;

export type useImagePlaceholderType = () => boolean;

export const ImagePlaceholderProvider: ImagePlaceholderProviderType = ({
  children,
}) => {
  return <>{children}</>;
};

export const useImagePlaceholder: useImagePlaceholderType = () => true;
