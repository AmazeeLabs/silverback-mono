import { Form as FormComponent, Formik } from 'formik';
import { GatsbyLinkProps, Link as GatsbyLink, navigate } from 'gatsby';
import { GatsbyImage, GatsbyImageProps } from 'gatsby-plugin-image';
import React, { ImgHTMLAttributes } from 'react';

import type { Image, Link, LinkProps } from './types';
import { Form, FormBuilderProps } from './types';
import {
  buildHtmlBuilder,
  buildUrlBuilder,
  FormikChanges,
  FormikInitialValues,
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

type ImageProps =
  | Omit<GatsbyImageProps, 'className'>
  | (Omit<ImgHTMLAttributes<HTMLImageElement>, 'className'> & {
      width: number;
      height: number;
    });

const isGatsbyImageProps = (
  props: ImageProps & { src?: string },
): props is Omit<GatsbyImageProps, 'className'> => {
  return !props.src;
};

export const buildImage = (props: ImageProps): Image => {
  const Element: Image = function GatsbyImageBuilder({ className }) {
    if (isGatsbyImageProps(props)) {
      return <GatsbyImage {...props} className={className} />;
    } else {
      const { width, height, ...rest } = props;
      return (
        <div
          style={{
            width: '100%',
            position: 'relative',
            paddingBottom: `${(height / width) * 100}%`,
          }}
        >
          <img
            {...rest}
            style={{
              display: 'block',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            className={className}
          />
        </div>
      );
    }
  };
  Element.src = isGatsbyImageProps(props)
    ? props.image.images.fallback?.src
    : props.src;
  return Element;
};

export const buildHtml = buildHtmlBuilder(buildLink);

export function buildForm<Values>({
  onChange,
  useInitialValues,
  ...formikProps
}: FormBuilderProps<Values>): Form<Values> {
  return function GatsbyFormBuilder({ children, ...formProps }) {
    return (
      <Formik
        onSubmit={(values) => {
          console.log('form submission:', values);
        }}
        {...formikProps}
      >
        <FormComponent {...formProps}>
          {onChange ? <FormikChanges onChange={onChange} /> : null}
          {useInitialValues ? (
            <FormikInitialValues useInitialValues={useInitialValues} />
          ) : null}
          {children}
        </FormComponent>
      </Formik>
    );
  };
}
