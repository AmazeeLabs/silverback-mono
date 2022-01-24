# React Framework Bridge

This module provides helper functions that allow to separate React component
libraries by providing exchangeable builders for components that are controlled
by the framework.

## The Problem

When building a React component library to be consumed by a framework like
[Gatsby](http://www.gatsbyjs.com) or [Next.js](https://nextjs.org/), some
fundamental components are bound to the framework. The most prominent candidate
is the simple `Link` component that should be used instead of a simple `a` tag
to enable fast navigation features. If a component then imports `Link` from
`gatsby`, it is tightly bound to the framework from then on. This means it can't
be used in another context, and even showcasing it in
[Storybook](https://storybook.js.org/) causes problems, because
[Gatsby internals have to be mocked](https://www.gatsbyjs.com/docs/how-to/testing/visual-testing-with-storybook).

## The Solution

This package aims to provide a pattern and set of helper functions to inject
these dependencies _along_ with the data structures that require them.

Consider this example:

```tsx
import React from 'react';
import { Link } from 'gatsby';

type TeaserProps = React.PropsWithChildren<{
  title: string;
  description: string;
  url: string;
}>;

export const Teaser = (props) => (
  <div className="teaser">
    <h2>{props.title}</h2>
    <div dangerouslySetInnerHTML={{ __html: props.description }} />
    <Link to={props.url} className="teaser__link">
      Learn more ...
    </Link>
  </div>
);
```

The component can only be used within a Gatsby project and links within the rich
text part won't even benefit from it! Apart from being solved in a very
questionable way using `dangerouslySetInnerHtml`.

We can use the types defined in this package to build our component in a less
dependent way:

```tsx
import React from 'react';
import { Link, Html } from '@amazeelabs/react-framework-bridge';

type TeaserProps = React.PropsWithChildren<{
  title: string;
  Description: Html;
  Link: Link;
}>;

export const Teaser = (props) => (
  <div className="teaser">
    <h2>{props.title}</h2>
    <div>
      <Description />
    </div>
    <Link className="teaser__link">Learn more ...</Link>
  </div>
);
```

Now we can use the builder functions provided to showcase the component in a
Story:

```tsx
import React from 'react';
import { Meta } from '@storybook/react';
import { Teaser as TeaserComponent } from '../teaser';
import {
  buildHtml,
  buildLink,
} from '@amazeelabs/react-framework-bridge/storybook';

export default {
  title: 'Components/Molecules/Teaser',
  component: TeaserComponent,
} as Meta;

export const Teaser = () => (
  <TeaserComponent
    title={'This is the title'}
    Description={buildHtml(
      '<p>This is a text with a <a href="https://www.amazeelabs.com">Link</a>.<p>',
    )}
    Link={buildLink({ href: '/about-us' })}
  />
);
```

When actually using the component in Gatsby, we simply use the helpers tailored
to this framework:

```tsx
import React from 'react';
import { Teaser } from 'my-ui-library';
import {
  buildHtml,
  buildLink,
} from '@amazeelabs/react-framework-bridge/gatsby';

export const query = graphql`...`;

const Homepage = (data) => (
  <div>
    <h1>Latest news</h1>
    {data.teasers.map((teaser) => (
      <Teaser
        title={teaser.title}
        Description={buildHtml(teaser.description)}
        Link={buildLink({ href: teaser.url })}
      />
    ))}
  </div>
);
export default Homepage;
```

Storybook and Gatsby are cleanly separated while Typescript still makes sure
that everything fits together!

## Supported Frameworks

Currently Gatsby and Storybook are supported.

## Supported components

### Link

The `buildLink` for Gatsby and Storybook functions accept a set of properties
that is equivalent to the allowed attributes of a standard Anchor element,
except the CSS-class attribute. Instead, it is possible to add `className` and
`activeClassName` properties to the resulting component to control the visual
appearance within the component library.

In Storybook, the `activeClassName` will be applied if the `href` attribute
contains `active`. In Gatsby it will use the built-in active-link functionality.

```tsx
const Link = buildLink({ href: '/active' });

//...

<Link className={'text-blue'} activeClassName={'text-red'}>
  I'm red!
</Link>;
```

The Link also exposes a `navigate` method that will cause the application to
navigate to its target.

```tsx
const Link = buildLink({ href: '/active' });

//...

<Button onClick={() => Link.navigate()}>To infinity and beyond!</Button>;
```

Both rendering `Link` and using `navigate` allow adding or override query
parameters and fragments from the user interface code.

```tsx
const Link = buildLink({ href: '/active' });

//...

<Link
  className={'text-blue'}
  activeClassName={'text-red'}
  query={{ foo: 'bar' }}
  fragment={'baz'}
>
  To infinity and beyond!
</Link>;

<Button
  onClick={() => Link.navigate({ query: { foo: 'bar' }, fragment: 'baz' })}
>
  To infinity and beyond!
</Button>;
```

### Images

Image support is very simple. The Storybook variant expects a `src` and an `alt`
text (along with any other valid image attributes), while Gatsby needs the data
object provided by `gatsby-plugin-image`. In both cases it's possible to pass
`className` to the resulting component to control the design.

```tsx
const Image = buildImage({ src: './cat.jpg', alt: 'A cat!' });

<Image className={'border-red'} />;
```

### Html

We also provide a dedicated component for rendering strings that contain HTML
markup, typically emitted by a content management system. In this case we just
pass the string containing the markup to the build function. The resulting
component then allows to control the visual appearance by either passing a class
string per element name or a function that results in a class.

```tsx
const Html = buildHtml(
  `<p>This is a test with a <a href="https://www.amazeelabs.com">link</a>.</p>`,
);
...

<Html
  classNames={{
    p: 'text-gray',
    a: (node) => node.attribs['href'].contains('amazee') ? 'text-orage' : 'text-blue'
  }}
/>
```

## Storybook actions integration

The `buildLink` and `buildForm` functions integrate with
[@storybook/addon-actions](https://www.npmjs.com/package/@storybook/addon-actions)
and
[@storybook/addon-interactions](https://www.npmjs.com/package/@storybook/addon-interactions).
A play function that clicks a `Link` or submits af `Form` will trigger an action
that is logged. Additionally, artificial arguments called `wouldNavigate` and
`wouldSubmit` are added to the story context. They can be used with jest's
assertions on mock functions to test actual interactions in a play function.

It needs to be added to the projects `.storybook/preview.tsx` file to work.
First, re-export the `argTypes` definition provided by this package to tell
Storybook that `wouldNavigate` and `wouldSubmit` are events that need to be
logged and mocked. To collect all occurences you also have to add the
`ActionsDecorator`.

```typescript
export { argTypes } from '@amazeelabs/react-framework-bridge/storybook';

import { ActionsDecorator } from '@amazeelabs/react-framework-bridge/storybook';

export const decorator = [ActionsDecorator];
```

Now you should be able to implement assertions in play functions like this:

```typescript
export const MyStory = {
  play: async (context) => {
    const canvas = within(context.canvasElement);
    fireEvent.click(await canvas.findByRole('link', { name: 'Test' }));
    await waitFor(() =>
      expect(context.args.wouldNavigate).toHaveBeenCalledWith('/test'),
    );
  },
};
```
