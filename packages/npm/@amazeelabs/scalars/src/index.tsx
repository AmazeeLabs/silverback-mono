import {
  Link as LinkComponent,
  useLocation as useLocationHook,
} from '@amazeelabs/bridge';
import type { Element } from 'hast';
import { selectAll } from 'hast-util-select';
import qs, { StringifiableRecord } from 'query-string';
import React, {
  AnchorHTMLAttributes,
  ComponentType,
  createElement,
  DetailedHTMLProps,
  Fragment,
} from 'react';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import rehypeSlug from 'rehype-slug';
import { omit } from 'remeda';
import { Pluggable, Plugin, unified } from 'unified';

declare const Url: unique symbol;
export type Url = string & {
  _opaque: typeof Url;
};

type LinkOverrideProps = {
  search?: StringifiableRecord;
  hash?: string;
};

type LinkDisplayProps = {
  activeClassName?: string;
};

function isUrl(input: any): input is Url {
  return typeof input === 'string';
}

export function overrideUrlParameters(
  url: Url | Omit<Location, 'navigate'>,
  search?: StringifiableRecord,
  hash?: string,
): Url {
  if (isUrl(url)) {
    if (url[0] === '/') {
      return overrideUrlParameters(
        `relative://${url}` as Url,
        search,
        hash,
      ).replace('relative://', '') as Url;
    }
    const parsed = qs.parseUrl(url);
    return qs.stringifyUrl(
      {
        url: parsed.url,
        fragmentIdentifier:
          typeof hash === 'undefined' ? parsed.fragmentIdentifier : hash,
        query: { ...parsed.query, ...search },
      },
      {
        skipNull: true,
      },
    ) as Url;
  } else {
    return overrideUrlParameters(
      `${url.pathname}${url.search ? `?${url.search}` : ''}${
        url.hash ? `#${url.hash}` : ''
      }` as Url,
      search,
      hash,
    ) as Url;
  }
}

export type LinkProps = Omit<
  DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>,
  'href'
> & { href: Url | Omit<Location, 'navigate'> } & LinkOverrideProps &
  LinkDisplayProps;

export function Link({ href, search, hash, ...props }: LinkProps) {
  return (
    <LinkComponent
      href={overrideUrlParameters(href, search, hash)}
      {...props}
    />
  );
}

export type Location = {
  pathname: string;
  search?: URLSearchParams;
  hash?: string;
  navigate: (
    url: Url | Location,
    search?: StringifiableRecord,
    hash?: string,
  ) => void;
};

export function useLocation(): Location | undefined {
  const location = useLocationHook();
  if (!location) {
    return undefined;
  }
  return {
    pathname: location.pathname,
    search: location.search ? new URLSearchParams(location.search) : undefined,
    hash: location.hash === '' ? undefined : location.hash.slice(1),
    navigate: (
      url: Location | Url,
      search?: StringifiableRecord,
      hash?: string,
    ) => {
      location.navigate(overrideUrlParameters(url, search, hash));
    },
  };
}

declare const ImageSource: unique symbol;
export type ImageSource = string & {
  _opaque: typeof ImageSource;
};

type ImageSourceStructure = {
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
  sources: Array<{
    media: string;
    src: string;
    srcset: string;
    width: number;
    height: number;
  }>;
};

export function Image({
  source,
  priority,
  alt,
  ...props
}: {
  source: ImageSource;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const { srcset, ...imageData } = JSON.parse(source) as ImageSourceStructure;
  return (
    <img
      decoding={priority ? 'sync' : 'async'}
      loading={priority ? 'eager' : 'lazy'}
      srcSet={srcset}
      {...imageData}
      // Set object fit to "cover", to never
      // distort an image, even if the width
      // and height don't match.
      // This is the case when an image is
      // loaded unprocessed for testing.
      style={{ objectFit: 'cover' }}
      alt={alt}
      {...props}
    />
  );
}

declare const Timestamp: unique symbol;
export type Timestamp = string & {
  _opaque: typeof Timestamp;
};

export function timestamp(input: Timestamp) {
  return new Date(input);
}

declare const Markup: unique symbol;
export type Markup = string & {
  _opaque: typeof Markup;
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

export function Html({
  markup,
  classNames,
  components,
  plugins,
}: {
  markup: Markup;
  classNames?: {
    [key: string]: string;
  };
  components?: Partial<{
    [TagName in keyof JSX.IntrinsicElements]:
      | keyof JSX.IntrinsicElements
      | ComponentType<{ node: Element } & JSX.IntrinsicElements[TagName]>;
  }>;
  plugins?: Pluggable[];
}) {
  return unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeAddClasses, classNames || {})
    .use(rehypeSlug)
    .use(plugins || [])
    .use(rehypeReact, {
      Fragment,
      createElement,
      passNode: true,
      components: {
        ...{
          a: (props) => {
            const { children, href, ...rest } = omit(props, ['node']);
            return createElement(
              Link,
              {
                href: (href || '/') as Url,
                ...rest,
              },
              children,
            );
          },
          ...components,
        },
      },
    })
    .processSync(markup).result;
}
