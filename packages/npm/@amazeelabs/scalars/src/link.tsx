import {
  Link as LinkComponent,
  navigate as navigateFunction,
} from '@amazeelabs/bridge';
import qs, { StringifiableRecord } from 'query-string';
import React, { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';

declare const Url: unique symbol;
export type Url = string & {
  _opaque: typeof Url;
};

type LinkOverrideProps = {
  query?: StringifiableRecord;
  fragment?: string;
};

type LinkTransitionProps = {
  transition?: string;
  reverse?: boolean;
};

type LinkDisplayProps = {
  activeClassName?: string;
};

export function overrideUrlParameters(
  url: string,
  query?: StringifiableRecord,
  fragment?: string,
): string {
  if (url[0] === '/') {
    return overrideUrlParameters(`relative://${url}`, query, fragment).replace(
      'relative://',
      '',
    );
  }
  const parsed = qs.parseUrl(url);
  return qs.stringifyUrl(
    {
      url: parsed.url,
      fragmentIdentifier:
        typeof fragment === 'undefined' ? parsed.fragmentIdentifier : fragment,
      query: { ...parsed.query, ...query },
    },
    {
      skipNull: true,
    },
  );
}

export type LinkProps = Omit<
  DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>,
  'href'
> & { href: Url } & LinkOverrideProps &
  LinkTransitionProps &
  LinkDisplayProps;

export function Link({ href, query, fragment, ...props }: LinkProps) {
  const target = overrideUrlParameters(href, query, fragment);
  return <LinkComponent href={target} {...props} />;
}

export function navigate(
  href: Url,
  config: {
    query?: StringifiableRecord;
    fragment?: string;
    transition?: string;
    reverse?: boolean;
  },
) {
  navigateFunction(overrideUrlParameters(href, config.query, config.fragment));
}
