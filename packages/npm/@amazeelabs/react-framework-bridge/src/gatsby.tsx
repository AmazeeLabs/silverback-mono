import { GatsbyLinkProps, Link as GatsbyLink, navigate } from 'gatsby';
import { GatsbyImage, GatsbyImageProps } from 'gatsby-plugin-image';
import React from 'react';

import type { Image, Link } from './types';
import { buildHtmlBuilder, isInternalTarget, isRelative } from './utils';

export const buildLink = ({
  href,
  target,
  ...props
}: Omit<GatsbyLinkProps<any>, 'className' | 'activeClassName' | 'to'> & {
  href?: string;
}): Link => {
  const Element: Link = function LinkBuilder({
    className,
    activeClassName,
    children,
  }) {
    return href && isInternalTarget(target) && isRelative(href) ? (
      // @ts-ignore GatsbyLink comply with type
      <GatsbyLink
        to={href}
        target={target}
        className={className}
        activeClassName={activeClassName}
        {...props}
      >
        {children}
      </GatsbyLink>
    ) : (
      <a className={className} target={target} href={href} {...props}>
        {children}
      </a>
    );
  };

  Element.navigate = () => href && navigate(href, props);

  return Element;
};

export const buildImage = (
  props: Omit<GatsbyImageProps, 'className'>,
): Image => {
  return function GatsbyImageBuilder({ className }) {
    return <GatsbyImage {...props} className={className} />;
  };
};

export const buildHtml = buildHtmlBuilder(buildLink);
