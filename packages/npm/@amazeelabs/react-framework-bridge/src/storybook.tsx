import { action } from '@storybook/addon-actions';
import React from 'react';

import { Image, ImageProps, Link, LinkProps } from './types';
import { buildHtmlBuilder, buildUrl } from './utils';

export const buildLink = ({
  href,
  segments,
  query,
  queryOptions,
  ...props
}: LinkProps): Link => {
  const target = segments ? buildUrl(segments, query, queryOptions) : href;
  const Element: Link = function MockLink({
    className,
    activeClassName,
    children,
  }) {
    return (
      <a
        href={target}
        onClick={(ev) => {
          ev.preventDefault();
          action('navigate to')(target);
        }}
        className={
          target?.includes('active')
            ? [className, activeClassName].filter((c) => !!c).join(' ')
            : className
        }
        {...props}
      >
        {children}
      </a>
    );
  };
  Element.navigate = () => action('navigate to')(target);
  return Element;
};

export const buildImage = (props: ImageProps): Image => {
  return function MockImage({ className }) {
    return <img {...props} className={className} />;
  };
};

export const buildHtml = buildHtmlBuilder(buildLink);
