import parse, {
  attributesToProps,
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from 'html-react-parser';
import { stringify } from 'qs';
import React, { ComponentProps } from 'react';

import { Html, LinkBuilder, LinkProps } from './types';

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

export const isElement = (
  node: DOMNode & { children?: DOMNode[] },
): node is Element => Array.isArray(node.children);

export const htmlParserOptions = (
  buildLink: LinkBuilder,
  classNames: ComponentProps<Html>['classNames'],
): HTMLReactParserOptions => ({
  replace: (node) => {
    if (isElement(node)) {
      const { attribs, children, tagName } = node;
      const props = attributesToProps(attribs);

      const className = classNames?.[node.name];
      const addedClass =
        typeof className === 'string'
          ? className
          : typeof className === 'function'
          ? className(node)
          : undefined;

      if (addedClass) {
        props['className'] = [props['className'], addedClass]
          .filter((c) => !!c)
          .join(' ');
      }

      switch (tagName) {
        case 'li': {
          const text = domToReact(
            children,
            htmlParserOptions(buildLink, classNames),
          );

          // Fix prose lists with breaks, by wrapping content in a <div>.
          // https://github.com/tailwindlabs/tailwindcss-typography/issues/68
          return (
            <li {...props}>
              <div>{text}</div>
            </li>
          );
        }
        case 'h2': {
          const text = domToReact(
            children,
            htmlParserOptions(buildLink, classNames),
          );
          if (typeof text !== 'string') {
            return;
          }
          return (
            <h2 {...props} id={props.id || slugify(text)}>
              {text}
            </h2>
          );
        }
        case 'a': {
          const Link = buildLink(props);
          return (
            <Link {...props}>
              {domToReact(children, htmlParserOptions(buildLink, classNames))}
            </Link>
          );
        }
        default: {
          return addedClass
            ? React.createElement(
                node.name,
                props,
                domToReact(children, htmlParserOptions(buildLink, classNames)),
              )
            : undefined;
        }
      }
    }
  },
});

export const buildHtmlBuilder =
  (buildLink: LinkBuilder) =>
  (input: string): Html => {
    const Element: Html = function MockHtml({ classNames }) {
      return <>{parse(input, htmlParserOptions(buildLink, classNames))}</>;
    };
    Element.initialHtmlString = input;
    return Element;
  };

const isTruthy = (i: string | null | undefined): i is string => Boolean(i);

const stripSlashes = (segment: string, index: number) => {
  if (index === 0) {
    return segment.replace(/^\/{2,}/g, '/').replace(/\/+$/g, '');
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
    ? segments.filter(isTruthy).map(stripSlashes).join('/')
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
