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

export function navigate(to: string) {
  window.location.href = to;
}

type Location = {
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
}

export function useLocation() : Location {
  return window.location;
}
