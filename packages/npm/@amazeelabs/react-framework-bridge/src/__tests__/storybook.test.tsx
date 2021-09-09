import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { buildImage, buildLink } from '../storybook';

const action = jest.fn();

jest.mock('@storybook/addon-actions', () => ({
  action: () => action,
}));

describe('buildLink', () => {
  beforeEach(jest.resetAllMocks);

  it('can build a link from segments and query parameters', () => {
    const Link = buildLink({
      segments: ['/foo', 'bar'],
      query: {
        a: 'b',
      },
    });
    render(<Link>Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual(
      '/foo/bar?a=b',
    );
  });

  it('allows the consumer to set query parameters', () => {
    const Link = buildLink({
      href: '/foo',
    });
    render(<Link query={{ a: 'b' }}>Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual('/foo?a=b');
  });

  it('allows the consumer to override query parameters', () => {
    const Link = buildLink({
      href: '/foo',
      query: { a: 'b' },
    });
    render(<Link query={{ a: 'c' }}>Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual('/foo?a=c');
  });

  it('allows the consumer to set a query fragment', () => {
    const Link = buildLink({
      href: '/foo',
    });
    render(<Link fragment="bar">Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual('/foo#bar');
  });

  it('allows the consumer to set query parameters and fragments', () => {
    const Link = buildLink({
      href: '/foo',
    });
    render(
      <Link query={{ a: 'b' }} fragment="bar">
        Test
      </Link>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toEqual(
      '/foo?a=b#bar',
    );
  });

  it('renders a simple link', () => {
    const Link = buildLink({ href: '#test' });
    render(<Link>test</Link>);
    expect(screen.getByRole('link').textContent).toEqual('test');
    expect(screen.getByRole('link').getAttribute('href')).toEqual('#test');
  });

  it('allows to pass a class', () => {
    const Link = buildLink({ href: '#test' });
    render(<Link className={'text-red'}>test</Link>);
    expect(screen.getByRole('link').getAttribute('class')).toEqual('text-red');
  });

  it('applies active class if the path contains "active"', () => {
    const Link = buildLink({ href: '/imsoactive' });
    render(
      <Link className={'text-red'} activeClassName={'text-green'}>
        test
      </Link>,
    );

    expect(screen.getByRole('link').getAttribute('class')).toEqual(
      'text-red text-green',
    );
  });

  it('does not break if path contains "active" and no active class is defined', () => {
    const Link = buildLink({ href: '/imsoactive' });
    render(<Link className={'text-red'}>test</Link>);
    expect(screen.getByRole('link').getAttribute('class')).toEqual('text-red');
  });

  it('logs a storybook action on click', () => {
    const Link = buildLink({ href: '#test' });
    render(<Link>test</Link>);
    fireEvent.click(screen.getByRole('link'));
    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith('#test');
  });

  it('exposes a navigate function that logs a storybook action', () => {
    const Link = buildLink({ href: '#test' });
    Link.navigate();
    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith('#test');
  });

  it('exposes a navigate function that logs a storybook action and allows to override queries and fragments', () => {
    const Link = buildLink({ href: '/foo', query: { a: 'b' } });
    Link.navigate({ query: { a: 'c' }, fragment: 'bar' });
    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith('/foo?a=c#bar');
  });
});

describe('buildImage', () => {
  it('renders an image with all attributes', () => {
    const Image = buildImage({ src: 'test.png', alt: 'Test' });
    render(<Image />);
    expect(screen.getByRole('img').getAttribute('src')).toEqual('test.png');
    expect(screen.getByRole('img').getAttribute('alt')).toEqual('Test');
  });

  it('allows to specify a classname', () => {
    const Image = buildImage({ src: 'test.png', alt: 'Test' });
    render(<Image className={'border-red'} />);
    expect(screen.getByRole('img').getAttribute('class')).toEqual('border-red');
  });
});
