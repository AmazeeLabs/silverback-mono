import { Form as FormComponent, Formik } from 'formik';
import { GatsbyLinkProps, Link as GatsbyLink, navigate } from 'gatsby';
import { GatsbyImage, GatsbyImageProps } from 'gatsby-plugin-image';
import React from 'react';

import type { Image, Link, LinkProps } from './types';
import { Form, FormBuilderProps } from './types';
import {
  buildHtmlBuilder,
  buildUrlBuilder,
  isInternalTarget,
  isRelative,
} from './utils';

export function buildLink<Query = {}>({
  href,
  segments,
  query,
  queryOptions,
  target,
  ...props
}: Omit<GatsbyLinkProps<any>, 'className' | 'activeClassName' | 'to'> & {
  href?: string;
} & Pick<LinkProps, 'segments' | 'query' | 'queryOptions'>): Link<Query> {
  const buildUrl = buildUrlBuilder(segments || [href], query, queryOptions);
  const Element: Link = function GatsbyLinkBuilder({
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
        rel={props.rel || (isRelative(uri) ? undefined : 'noreferrer')}
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

  Element.href = buildUrl();

  return Element as Link<Query>;
}

export const buildImage = (
  props: Omit<GatsbyImageProps, 'className'>,
): Image => {
  const Element: Image = function GatsbyImageBuilder({ className }) {
    return <GatsbyImage {...props} className={className} />;
  };
  Element.src = props.image.images.fallback?.src;
  return Element;
};

export const buildHtml = buildHtmlBuilder(buildLink);

export function buildForm<Values>(
  formikProps: FormBuilderProps<Values>,
): Form<Values> {
  return function GatsbyFormBuilder(formProps) {
    return (
      <Formik
        onSubmit={(values) => {
          console.log('form submission:', values);
        }}
        {...formikProps}
      >
        <FormComponent {...formProps} />
      </Formik>
    );
  };
}
