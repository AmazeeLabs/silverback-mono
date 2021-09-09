import { action } from '@storybook/addon-actions';
import React from 'react';

import { Image, ImageProps, Link, LinkProps } from './types';
import { buildHtmlBuilder, buildUrlBuilder } from './utils';

export const buildLink = ({
  href,
  segments,
  query,
  queryOptions,
  ...props
}: LinkProps): Link => {
  const buildUrl = buildUrlBuilder(segments || [href], query, queryOptions);

  const Element: Link = function MockLink({
    className,
    activeClassName,
    query: queryOverride,
    fragment,
    children,
  }) {
    const target = buildUrl(queryOverride, fragment);
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
  Element.navigate = (opts) => {
    const target = buildUrl(opts?.query, opts?.fragment);
    action('navigate to')(target);
  };
  return Element;
};

export const buildImage = (props: ImageProps): Image => {
  return function MockImage({ className }) {
    return <img {...props} className={className} />;
  };
};

export const buildHtml = buildHtmlBuilder(buildLink);
