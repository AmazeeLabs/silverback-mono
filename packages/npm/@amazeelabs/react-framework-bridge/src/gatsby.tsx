import { GatsbyLinkProps, Link as GatsbyLink, navigate } from 'gatsby';
import { GatsbyImage, GatsbyImageProps } from 'gatsby-plugin-image';
import React from 'react';

import type { Image, Link, LinkProps } from './types';
import {
  buildHtmlBuilder,
  buildUrlBuilder,
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
  const buildUrl = buildUrlBuilder(segments || [href], query, queryOptions);
  const Element: Link = function LinkBuilder({
    className,
    activeClassName,
    children,
    query: queryOverride,
    fragment,
  }) {
    const uri = buildUrl(queryOverride, fragment);
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

  Element.navigate = (opts) => {
    const uri = buildUrl(opts?.query, opts?.fragment);
    navigate(uri, props);
  };

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
