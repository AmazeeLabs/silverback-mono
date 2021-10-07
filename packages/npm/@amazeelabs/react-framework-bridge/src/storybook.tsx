import { action } from '@storybook/addon-actions';
import { Form as FormComponent, Formik } from 'formik';
import React from 'react';

import {
  Form,
  FormBuilderProps,
  Image,
  ImageProps,
  Link,
  LinkProps,
} from './types';
import { buildHtmlBuilder, buildUrlBuilder } from './utils';

export function buildLink<Query = {}>({
  href,
  segments,
  query,
  queryOptions,
  ...props
}: LinkProps<Query>): Link<Query> {
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
  Element.href = buildUrl();
  return Element as Link<Query>;
}

export const buildImage = (props: ImageProps): Image => {
  const Element: Image = function MockImage({ className }) {
    return <img {...props} className={className} />;
  };
  Element.src = props.src;
  return Element;
};

export const buildHtml = buildHtmlBuilder(buildLink);

export function buildForm<Values>(
  formikProps: FormBuilderProps<Values>,
): Form<Values> {
  return function MockForm(formProps) {
    return (
      <Formik
        onSubmit={(values) => {
          action('form submission')(values);
        }}
        {...formikProps}
      >
        <FormComponent {...formProps} />
      </Formik>
    );
  };
}
