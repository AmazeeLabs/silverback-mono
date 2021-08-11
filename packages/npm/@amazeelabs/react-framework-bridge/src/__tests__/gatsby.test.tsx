import { render, screen } from '@testing-library/react';
import { GatsbyLinkProps } from 'gatsby';
import React from 'react';

import { buildLink } from '../gatsby';

const gatsbyNav = jest.fn();

type gatsby = {
  Link: (props: GatsbyLinkProps<any>) => JSX.Element;
  navigate: (to: string) => Promise<void>;
};

jest.mock(
  'gatsby',
  (): gatsby => ({
    Link: ({ children, to, activeClassName, ...props }) => (
      <a href={to} data-gatsby={true} {...props}>
        {children}
      </a>
    ),
    navigate: (to: string) => gatsbyNav(to),
  }),
);

describe('buildLink', () => {
  it('renders a Gatsby link for an internal path', () => {
    const Link = buildLink({ href: '/test' });
    render(<Link>Test</Link>);
    expect(screen.getByRole('link').getAttribute('data-gatsby')).toBeTruthy();
  });

  it('renders normal link for an external path', () => {
    const Link = buildLink({ href: 'http://www.amazeelabs.com' });
    render(<Link>Test</Link>);
    expect(screen.getByRole('link').getAttribute('data-gatsby')).toBeFalsy();
  });

  it('renders normal link for an external target', () => {
    const Link = buildLink({
      href: 'http://www.amazeelabs.com',
      target: '_blank',
    });
    render(<Link>Test</Link>);
    expect(screen.getByRole('link').getAttribute('data-gatsby')).toBeFalsy();
  });

  it('renders normal link for an mailto address', () => {
    const Link = buildLink({
      href: 'mailto:development@amazeelabs.com',
    });
    render(<Link>Test</Link>);
    expect(screen.getByRole('link').getAttribute('data-gatsby')).toBeFalsy();
  });

  it('exposes Gatsby navigate', () => {
    const Link = buildLink({ href: '#test' });
    Link.navigate();
    expect(gatsbyNav).toHaveBeenCalledTimes(1);
    expect(gatsbyNav).toHaveBeenCalledWith('#test');
  });
});
