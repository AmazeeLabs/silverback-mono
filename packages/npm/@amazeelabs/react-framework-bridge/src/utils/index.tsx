import { FormikValues, useFormikContext } from 'formik';
import { Element } from 'hast';
import { isElement } from 'hast-util-is-element';
import { selectAll } from 'hast-util-select';
import { omit } from 'lodash';
import { stringify } from 'qs';
import { createElement, Fragment, useEffect } from 'react';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import rehypeSlug from 'rehype-slug';
import { Plugin, unified } from 'unified';
import { modifyChildren } from 'unist-util-modify-children';
import { visit } from 'unist-util-visit';

import { FormBuilderProps, Html, LinkBuilder, LinkProps } from '../types';

export * from './atomic';

export const isInternalTarget = (target?: string) =>
  typeof target === 'undefined' || target === '' || target === '_self';

export const isRelative = (url?: string) =>
  url?.startsWith('#') ||
  url?.startsWith('?') ||
  Boolean(url?.match(/^\/(?!\/)/));

// https://gist.github.com/max10rogerio/c67c5d2d7a3ce714c4bc0c114a3ddc6e
export const slugify = (...args: (string | number)[]): string => {
  const value = args.join(' ');

  return value
    .normalize('NFD') // split an accented letter in the base letter and the accent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, '-'); // separator
};

/**
 * React component that will catch any updated field values within a Form.
 *
 * @param onChange Callback the updates will be sent to.
 * @constructor
 */
export function FormikChanges<T extends FormikValues>({
  onChange,
}: {
  onChange: (values: T) => void;
}) {
  const { values } = useFormikContext<T>();
  useEffect(() => {
    onChange(values);
  }, [values, onChange]);
  return null;
}

export function FormikInitialValues<T extends FormikValues>({
  useInitialValues,
}: Required<Pick<FormBuilderProps<T>, 'useInitialValues'>>) {
  const { touched, setFieldTouched, setFieldValue } = useFormikContext<T>();
  const values = useInitialValues();
  useEffect(() => {
    if (values) {
      for (const field in values) {
        if (!touched[field]) {
          setFieldValue(field, values[field], false);
          setFieldTouched(field, true, false);
        }
      }
    }
  }, [touched, setFieldTouched, setFieldValue, values]);
  return null;
}

const rehypeTailwindLists: Plugin = () => (tree) => {
  visit(
    tree,
    'element',
    modifyChildren((node) => {
      if (isElement(node, 'li')) {
        node.children = [
          {
            type: 'element',
            tagName: 'div',
            children: node.children,
          },
        ];
      }
    }),
  );
};

const rehypeAddClasses: Plugin<[{ [key: string]: string }], Element> =
  (settings) => (tree) => {
    Object.keys(settings || {}).forEach((matcher) => {
      const cls = settings[matcher];
      selectAll(matcher, tree).forEach((node) => {
        if (!node.properties) {
          node.properties = { class: cls };
        } else {
          node.properties.class = [node.properties.class, cls].join();
        }
        node.properties['class'] = cls;
      });
    });
  };

export const buildHtmlBuilder =
  (buildLink: LinkBuilder) =>
  (input: string): Html => {
    const Element: Html = function MockHtml({ classNames, components }) {
      return unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeAddClasses, classNames || {})
        .use(rehypeSlug)
        .use(rehypeTailwindLists)
        .use(rehypeReact, {
          Fragment,
          createElement,
          passNode: true,
          components: {
            ...{
              a: (props) => {
                const { children, ...rest } = omit(props, 'node');
                const Link = buildLink(rest);
                return createElement(Link, {}, children);
              },
              ...components,
            },
          },
        })
        .processSync(input).result;
    };
    Element.initialHtmlString = input;
    return Element;
  };

const isTruthy = (i: string | null | undefined): i is string => Boolean(i);

const stripSlashes = (segment: string, index: number) => {
  if (index === 0) {
    return segment === '/'
      ? segment
      : segment.replace(/^\/{2,}/g, '/').replace(/\/+$/g, '');
  }

  return segment.replace(/^\/+|\/+$/g, '');
};

export const buildUrl = (
  segments: LinkProps['segments'],
  query?: LinkProps['query'],
  queryOptions?: LinkProps['queryOptions'],
  fragment?: string,
) => {
  const url = segments
    ? segments.filter(isTruthy).map(stripSlashes).join('/').replace(/^\/+/, '/')
    : '';

  const queryString = stringify(query, {
    skipNulls: true,
    ...queryOptions,
  });

  return [
    [url || '', queryString === '' ? null : queryString]
      .filter((i) => typeof i === 'string')
      .join('?'),
    fragment,
  ]
    .filter(isTruthy)
    .join('#');
};

export const buildUrlBuilder =
  (
    segments: LinkProps['segments'],
    query?: LinkProps['query'],
    queryOptions?: LinkProps['queryOptions'],
    fragment?: string,
  ) =>
  (queryOverride?: { [key: string]: string }, fragmentOverride?: string) =>
    buildUrl(
      segments,
      { ...(query || {}), ...(queryOverride || {}) },
      queryOptions,
      fragmentOverride || fragment,
    );
