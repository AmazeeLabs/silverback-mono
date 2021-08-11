import { action } from '@storybook/addon-actions';
import React from 'react';

import { Image, ImageProps, Link, LinkProps } from './types';
import { buildHtmlBuilder } from './utils';

export const buildLink = ({ href, ...props }: LinkProps): Link => {
  const Element: Link = function MockLink({
    className,
    activeClassName,
    children,
  }) {
    return (
      <a
        href={href}
        onClick={(ev) => {
          ev.preventDefault();
          action('navigate to')(href);
        }}
        className={
          href?.includes('active')
            ? [className, activeClassName].filter((c) => !!c).join(' ')
            : className
        }
        {...props}
      >
        {children}
      </a>
    );
  };
  Element.navigate = () => action('navigate to')(href);
  return Element;
};

export const buildImage = (props: ImageProps): Image => {
  return function MockImage({ className }) {
    return <img {...props} className={className} />;
  };
};

export const buildHtml = buildHtmlBuilder(buildLink);
