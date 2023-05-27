import React, { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';

export function Link(
  props: DetailedHTMLProps<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
) {
  return (
    <a href={props.href} className={props.className}>
      {props.children}
    </a>
  );
}

export type Location = {
  /**
   * The url path.
   */
  pathname: string;
  /**
   * The query string, including '?' if not empty.
   */
  search: string;
  /**
   * The current hash, including '#' if not empty.
   */
  hash: string;

  /**
   * Change the location to a given url.
   */
  navigate: (to: string) => void;
};

export function useLocation(): Location | undefined {
  return {
    ...window.location,
    navigate(to: string) {
      window.location.href = to;
    },
  };
}
