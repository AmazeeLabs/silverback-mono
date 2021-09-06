import { GatsbyLinkProps, Link as GatsbyLink, navigate } from 'gatsby';
import { GatsbyImage, GatsbyImageProps } from 'gatsby-plugin-image';
import React from 'react';

import type { Image, Link, LinkProps } from './types';
import {
  buildHtmlBuilder,
  buildUrl,
  isInternalTarget,
  isRelative,
} from './utils';

export const buildLink = ({
  href,
  segments,
  query,
  queryOptions,
  target,
  ...props
}: Omit<GatsbyLinkProps<any>, 'className' | 'activeClassName' | 'to'> & {
  href?: string;
} & Pick<LinkProps, 'segments' | 'query' | 'queryOptions'>): Link => {
  const uri = segments ? buildUrl(segments, query, queryOptions) : href;
  const Element: Link = function LinkBuilder({
    className,
    activeClassName,
    children,
  }) {
    return uri && isInternalTarget(target) && isRelative(uri) ? (
      // @ts-ignore GatsbyLink comply with type
      <GatsbyLink
        to={uri}
        target={target}
        className={className}
        activeClassName={activeClassName}
        {...props}
      >
        {children}
      </GatsbyLink>
    ) : (
      <a
        className={className}
        target={target || '_blank'}
        href={uri}
        {...props}
      >
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
