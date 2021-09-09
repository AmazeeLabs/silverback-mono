import { Element } from 'html-react-parser';
import { stringify } from 'qs';
import React from 'react';

export type ClassFunction = (domNode: Element) => string | null;

export type Html = React.VFC<{
  classNames?: {
    [key: string]: string | ClassFunction;
  };
}>;

export type HtmlBuilder = (input: string) => Html;

export type Image = React.VFC<{
  className?: string;
}>;

export type ImageProps = Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'className'
> & { alt: string };

export type ImageBuilder = (props: ImageProps) => Image;

export type Link = React.FC<{
  className?: string;
  activeClassName?: string;
  query?: { [key: string]: string };
  fragment?: string;
}> & {
  navigate: (opts?: {
    query?: { [key: string]: string };
    fragment?: string;
  }) => void;
};

export type LinkProps = Omit<
  React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
  'className'
> & {
  segments?: Array<string | null | undefined>;
  query?: Parameters<typeof stringify>[0];
  queryOptions?: Parameters<typeof stringify>[1];
};

export type LinkBuilder = (props: LinkProps) => Link;
