import { DecoratorFn } from '@storybook/react';
import { Form as FormComponent, Formik } from 'formik';
import React, { PropsWithChildren, useEffect, useRef } from 'react';

import {
  Form,
  FormBuilderProps,
  Image,
  ImageProps,
  Link,
  LinkProps,
} from './types';
import {
  buildHtmlBuilder,
  buildUrlBuilder,
  FormikChanges,
  FormikInitialValues,
} from './utils';

export type ActionsContext = {
  wouldNavigate: (to: string) => void;
  wouldSubmit: (values: any) => void;
};

const ActionsContext = React.createContext<ActionsContext>({
  wouldNavigate: () => undefined,
  wouldSubmit: () => undefined,
});

export const argTypes = {
  wouldSubmit: { action: 'would-submit' },
  wouldNavigate: { action: 'would-navigate' },
};

const ActionsWrapper = ({
  wouldNavigate,
  wouldSubmit,
  children,
}: PropsWithChildren<ActionsContext>) => {
  const eventBoundary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    eventBoundary.current?.addEventListener('would-navigate', (event) => {
      if (event instanceof CustomEvent) {
        wouldNavigate(event.detail);
      }
    });

    eventBoundary.current?.addEventListener('would-submit', (event) => {
      if (event instanceof CustomEvent) {
        wouldSubmit(event.detail);
      }
    });
  });
  return (
    <ActionsContext.Provider
      value={{
        wouldSubmit: wouldSubmit,
        wouldNavigate: wouldNavigate,
      }}
    >
      <div id="storybook-event-boundary" ref={eventBoundary}>
        {children}
      </div>
    </ActionsContext.Provider>
  );
};

export const ActionsDecorator: DecoratorFn = (story, context) => {
  return (
    <ActionsWrapper
      wouldNavigate={context.args.wouldNavigate}
      wouldSubmit={context.args.wouldSubmit}
    >
      {story(context)}
    </ActionsWrapper>
  );
};

export function buildLink<Query = {}>({
  href,
  segments,
  query,
  queryOptions,
  ...props
}: LinkProps<Query>): Link<Query> {
  const buildUrl = buildUrlBuilder(segments || [href], query, queryOptions);

  const Element: Link = function StorybookLinkBuilder({
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
          document.getElementById('storybook-event-boundary')?.dispatchEvent(
            new CustomEvent('would-navigate', {
              detail: target,
            }),
          );
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
    document.getElementById('storybook-event-boundary')?.dispatchEvent(
      new CustomEvent('would-navigate', {
        detail: target,
      }),
    );
  };
  Element.href = buildUrl();
  return Element as Link<Query>;
}

export const buildImage = (props: ImageProps): Image => {
  const Element: Image = function StorybookImageBuilder({ className }) {
    return <img {...props} className={className} />;
  };
  Element.src = props.src;
  return Element;
};

export const buildHtml = buildHtmlBuilder(buildLink);

export function buildForm<Values>({
  onChange,
  useInitialValues,
  ...formikProps
}: FormBuilderProps<Values>): Form<Values> {
  return function StorybookFormBuilder({ children, ...formProps }) {
    return (
      <Formik
        onSubmit={(values) => {
          document.getElementById('storybook-event-boundary')?.dispatchEvent(
            new CustomEvent('would-submit', {
              detail: values,
            }),
          );
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
