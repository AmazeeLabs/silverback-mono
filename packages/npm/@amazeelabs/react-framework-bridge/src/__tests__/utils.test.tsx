import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Link, LinkProps } from '../types';
import { buildHtmlBuilder, isElement, isRelative } from '../utils';

describe('isRelative', () => {
  it('returns true for a relative url', () => {
    expect(isRelative('/test')).toBeTruthy();
  });
  it('returns false for a full url', () => {
    expect(isRelative('http://www.amazeelabs.com')).toBeFalsy();
  });
  it('returns false for a url without the host', () => {
    expect(isRelative('//www.amazeelabs.com')).toBeFalsy();
  });
  it('returns false for a mailto: url', () => {
    expect(isRelative('mailto:development@amazeelabs.com')).toBeFalsy();
  });
});

const nav = jest.fn();
const buildLink = ({ href, ...props }: LinkProps): Link => {
  const Element: Link = function MockLink({ className, children }) {
    return (
      <a
        {...props}
        href={href}
        onClick={(ev) => {
          ev.preventDefault();
          nav(href);
        }}
        className={className}
      >
        {children}
      </a>
    );
  };
  Element.navigate = () => nav(href);
  return Element;
};

const buildHtml = buildHtmlBuilder(buildLink);

describe('buildHtmlBuilder', () => {
  beforeEach(jest.resetAllMocks);

  it('renders a simple paragraph', () => {
    const Html = buildHtml('<main><p>Test</p></main>');
    render(<Html />);
    expect(screen.getByRole('main')).toMatchInlineSnapshot(`
<main>
  <p>
    Test
  </p>
</main>
`);
  });

  it('wraps list element contents in a div to avoid Tailwind styling issues', () => {
    // Fix prose lists with breaks, by wrapping content in a <div>.
    // https://github.com/tailwindlabs/tailwindcss-typography/issues/68

    const Html = buildHtml('<main><ul><li>Test</li></ul></main>');
    render(<Html />);
    expect(screen.getByRole('main')).toMatchInlineSnapshot(`
<main>
  <ul>
    <li>
      <div>
        Test
      </div>
    </li>
  </ul>
</main>
`);
  });

  it('adds automatic ids to h2 elements', () => {
    const Html = buildHtml('<main><h2>Test</h2></main>');
    render(<Html />);
    expect(screen.getByRole('main')).toMatchInlineSnapshot(`
<main>
  <h2
    id="test"
  >
    Test
  </h2>
</main>
`);
  });

  it('applies framework-specific link components', () => {
    const Html = buildHtml('<main><a href="/test">Test</a></main>');
    render(<Html />);
    expect(screen.getByRole('main')).toMatchInlineSnapshot(`
<main>
  <a
    href="/test"
  >
    Test
  </a>
</main>
`);

    fireEvent.click(screen.getByRole('link'));
    expect(nav).toHaveBeenCalledTimes(1);
    expect(nav).toHaveBeenCalledWith('/test');
  });

  it('allows to define classes for elements', () => {
    const Html = buildHtml('<main><p>Test</p></main>');
    render(
      <Html
        classNames={{
          p: 'text-red',
        }}
      />,
    );
    expect(screen.getByRole('main')).toMatchInlineSnapshot(`
<main>
  <p
    class="text-red"
  >
    Test
  </p>
</main>
`);
  });

  it('allows to define class functions for elements', () => {
    const Html = buildHtml(
      '<main>' +
        '<a href="http://www.amazeelabs.com">Amazee</a>' +
        '<a href="http://www.google.com">Google</a>' +
        '</main>',
    );
    render(
      <Html
        classNames={{
          a: (domNode) =>
            isElement(domNode) && domNode.attribs['href'].includes('google')
              ? 'text-blue'
              : null,
        }}
      />,
    );
    expect(screen.getByRole('main')).toMatchInlineSnapshot(`
<main>
  <a
    href="http://www.amazeelabs.com"
  >
    Amazee
  </a>
  <a
    class="text-blue"
    href="http://www.google.com"
  >
    Google
  </a>
</main>
`);
  });
});
