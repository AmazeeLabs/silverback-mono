import type { Element } from 'hast';
import { selectAll } from 'hast-util-select';
import { ComponentType, createElement, Fragment } from 'react';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import rehypeSlug from 'rehype-slug';
import { omit } from 'remeda';
import { Pluggable, Plugin, unified } from 'unified';

import { Link, Url } from './link';

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
