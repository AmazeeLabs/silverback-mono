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
