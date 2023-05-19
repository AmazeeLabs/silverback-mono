import {
    Link as LinkComponent,
    navigate as navigateFunction,
} from '@amazeelabs/bridge';
import type { Element } from 'hast';
import { selectAll } from 'hast-util-select';
import qs, { StringifiableRecord } from 'query-string';
import React, { AnchorHTMLAttributes, ComponentType, createElement, DetailedHTMLProps , Fragment } from 'react';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import rehypeSlug from 'rehype-slug';
import { omit } from 'remeda';
import { Pluggable, Plugin, unified } from 'unified';

export { useLocation } from '@amazeelabs/bridge';

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
