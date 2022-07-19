import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FormikValues } from 'formik';
import React, { useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';

import {
  ActionsDecorator,
  buildForm,
  buildHtml,
  buildImage,
  buildLink,
  createLocation,
  layoutArgsEnhancer,
  LayoutStory,
  OrganismDecorator,
  OrganismStory,
  renderRouteStory,
  RouteStory,
  useLocation,
} from '../storybook';
import { type } from '../test-utils';
import {
  AsyncContent,
  Content,
  ContentHeader,
  Footer,
  Header,
  Page,
  PageLayout,
  SyncContent,
} from '../utils/example-ui';

const action = jest.fn();

const wouldNavigate = jest.fn();
const wouldSubmit = jest.fn();

jest.mock('@storybook/addon-actions', () => ({
  action: () => action,
}));

beforeEach(jest.resetAllMocks);

describe('createLocation', () => {
  test('creates a relative url', () => {
    const location = createLocation('/foo?a=b#bar');
    expect(location.params.has('a')).toBeTruthy();
    expect(location.params.get('a')).toEqual('b');
    expect(location).toEqual({
      pathname: '/foo',
      params: new URLSearchParams('?a=b'),
      hash: 'bar',
    });
  });
});

describe('buildLink', () => {
  it('can build a link from segments and query parameters', () => {
    const Link = buildLink({
      segments: ['/foo', 'bar'],
      query: {
        a: 'b',
      },
    });
    expect(Link.href).toEqual('/foo/bar?a=b');
    render(<Link>Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual(
      '/foo/bar?a=b',
    );
  });

  it('can build a link only from query parameters', () => {
    const Link = buildLink({
      query: {
        a: 'b',
      },
    });
    expect(Link.href).toEqual('?a=b');
    render(<Link>Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual('?a=b');
  });

  it('allows the consumer to set query parameters', () => {
    const Link = buildLink<{ a: string }>({
      href: '/foo',
    });
    expect(Link.href).toEqual('/foo');
    render(<Link query={{ a: 'b' }}>Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual('/foo?a=b');
  });

  it('allows the consumer to override query parameters', () => {
    const Link = buildLink<{ a: string }>({
      href: '/foo',
      query: { a: 'b' },
    });
    expect(Link.href).toEqual('/foo?a=b');
    render(<Link query={{ a: 'c' }}>Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual('/foo?a=c');
  });

  it('allows the consumer to set a query fragment', () => {
    const Link = buildLink({
      href: '/foo',
    });
    expect(Link.href).toEqual('/foo');
    render(<Link fragment="bar">Test</Link>);
    expect(screen.getByRole('link').getAttribute('href')).toEqual('/foo#bar');
  });

  it('allows the consumer to set query parameters and fragments', () => {
    const Link = buildLink<{ a: string }>({
      href: '/foo',
    });
    expect(Link.href).toEqual('/foo');
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
    expect(Link.href).toEqual('#test');
    render(<Link>test</Link>);
    expect(screen.getByRole('link').textContent).toEqual('test');
    expect(screen.getByRole('link').getAttribute('href')).toEqual('#test');
  });

  it('allows to pass a class', () => {
    const Link = buildLink({ href: '#test' });
    expect(Link.href).toEqual('#test');
    render(<Link className={'text-red'}>test</Link>);
    expect(screen.getByRole('link').getAttribute('class')).toEqual('text-red');
  });

  it('applies active class if the path contains "active"', () => {
    const Link = buildLink({ href: '/imsoactive' });
    expect(Link.href).toEqual('/imsoactive');
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
    expect(Link.href).toEqual('/imsoactive');
    render(<Link className={'text-red'}>test</Link>);
    expect(screen.getByRole('link').getAttribute('class')).toEqual('text-red');
  });

  it('tracks a click event in the ActionsDecorator ', () => {
    const Link = buildLink({ href: '#test' });
    expect(Link.href).toEqual('#test');
    render(
      ActionsDecorator(() => <Link>test</Link>, {
        args: { wouldNavigate },
      } as any),
    );
    act(() => {
      fireEvent.click(screen.getByRole('link'));
    });
    expect(wouldNavigate).toHaveBeenCalledTimes(1);
    expect(wouldNavigate).toHaveBeenCalledWith('#test');
  });

  it('exposes a navigate function that tracks a would-navigate event in the ActionsDecorator', () => {
    const Link = buildLink({ href: '#test' });
    expect(Link.href).toEqual('#test');
    render(
      ActionsDecorator(
        (props) => {
          return <button onClick={props.args.Link.navigate()}>test</button>;
        },
        {
          args: { wouldNavigate, Link },
        } as any,
      ),
    );
    act(() => {
      Link.navigate();
    });
    expect(wouldNavigate).toHaveBeenCalledTimes(1);
    expect(wouldNavigate).toHaveBeenCalledWith('#test');
  });

  it('exposes a navigate function that logs a storybook action and allows to override queries and fragments', () => {
    const Link = buildLink({ href: '/foo', query: { a: 'b' } });
    expect(Link.href).toEqual('/foo?a=b');
    render(
      ActionsDecorator(
        (props) => {
          return <button onClick={props.args.Link.navigate()}>test</button>;
        },
        {
          args: { wouldNavigate, Link },
        } as any,
      ),
    );
    act(() => {
      Link.navigate({ query: { a: 'c' }, fragment: 'bar' });
    });
    expect(wouldNavigate).toHaveBeenCalledTimes(1);
    expect(wouldNavigate).toHaveBeenCalledWith('/foo?a=c#bar');
  });

  it('exposes the changing locations with the `useLocation` hook', () => {
    const LinkA = buildLink({ href: '/foo', query: { a: 'b' } });
    const LinkB = buildLink({ href: '/bar', query: { a: 'c' } });
    const locationTest = jest.fn();

    function Test() {
      const location = useLocation();
      useEffect(() => {
        locationTest(location);
      }, [location]);
      return (
        <div>
          <LinkA fragment="x">A</LinkA>
          <LinkB fragment="y">B</LinkB>
        </div>
      );
    }
    render(
      ActionsDecorator(() => <Test />, {
        args: { wouldNavigate },
      } as any),
    );

    act(() => {
      fireEvent.click(screen.getByRole('link', { name: 'A' }));
    });

    act(() => {
      fireEvent.click(screen.getByRole('link', { name: 'B' }));
    });

    expect(locationTest).toHaveBeenCalledTimes(3);
    expect(locationTest).toHaveBeenNthCalledWith(1, {
      pathname: '/',
      params: new URLSearchParams(),
      hash: '',
    });
    expect(locationTest).toHaveBeenNthCalledWith(2, {
      pathname: '/foo',
      params: new URLSearchParams('?a=b'),
      hash: 'x',
    });
    expect(locationTest).toHaveBeenNthCalledWith(3, {
      pathname: '/bar',
      params: new URLSearchParams('?a=c'),
      hash: 'y',
    });
  });

  it('allows to set an initial location', () => {
    const locationTest = jest.fn();

    function Test() {
      const location = useLocation();
      useEffect(() => {
        locationTest(location);
      }, [location]);
      return <div />;
    }
    render(
      ActionsDecorator(() => <Test />, {
        args: {},
        parameters: { initialLocation: '/foo?bar=baz#xyz' },
      } as any),
    );

    expect(locationTest).toHaveBeenCalledTimes(1);
    expect(locationTest).toHaveBeenNthCalledWith(1, {
      pathname: '/foo',
      params: new URLSearchParams('?bar=baz'),
      hash: 'xyz',
    });
  });
});

describe('buildImage', () => {
  it('renders an image with all attributes', () => {
    const Image = buildImage({ src: 'test.png', alt: 'Test' });
    expect(Image.src).toEqual('test.png');
    render(<Image />);
    expect(screen.getByRole('img').getAttribute('src')).toEqual('test.png');
    expect(screen.getByRole('img').getAttribute('alt')).toEqual('Test');
  });

  it('allows to specify a classname', () => {
    const Image = buildImage({ src: 'test.png', alt: 'Test' });
    expect(Image.src).toEqual('test.png');
    render(<Image className={'border-red'} />);
    expect(screen.getByRole('img').getAttribute('class')).toEqual('border-red');
  });
});

describe('buildForm', () => {
  it('logs a storybook action on submit', async () => {
    const Form = buildForm({ initialValues: { foo: '' } });
    render(
      ActionsDecorator(
        (props) => {
          return (
            <props.args.Form>
              <Field type="text" name="foo" />
              <button type="submit" />
            </props.args.Form>
          );
        },
        {
          args: { wouldSubmit, Form },
        } as any,
      ),
    );
    await userEvent.type(screen.getByRole('textbox'), 'b');
    await userEvent.type(screen.getByRole('textbox'), 'a');
    await userEvent.type(screen.getByRole('textbox'), 'r');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(wouldSubmit).toHaveBeenCalledTimes(1);
      expect(wouldSubmit).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });

  it('also sends submission to the onSubmit callback', async () => {
    const callback = jest.fn();
    const Form = buildForm({ initialValues: { foo: '' }, onSubmit: callback });
    render(
      ActionsDecorator(
        (props) => {
          return (
            <props.args.Form>
              <Field type="text" name="foo" />
              <button type="submit" />
            </props.args.Form>
          );
        },
        {
          args: { wouldSubmit, Form },
        } as any,
      ),
    );
    await type(screen.getByRole('textbox'), 'bar');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(wouldSubmit).toHaveBeenCalledTimes(1);
      expect(wouldSubmit).toHaveBeenCalledWith({ foo: 'bar' });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ foo: 'bar' }, expect.anything());
    });
  });

  it('emits value changes via the "onChange" callback', async () => {
    const onChange = jest.fn();
    const Form = buildForm({ initialValues: { foo: '' }, onChange });
    render(
      <Form>
        <Field type="text" name="foo" />
        <button type="submit" />
      </Form>,
    );
    await type(screen.getByRole('textbox'), 'bar');
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(4);
      expect(onChange).toHaveBeenNthCalledWith(1, { foo: '' });
      expect(onChange).toHaveBeenNthCalledWith(2, { foo: 'b' });
      expect(onChange).toHaveBeenNthCalledWith(3, { foo: 'ba' });
      expect(onChange).toHaveBeenNthCalledWith(4, { foo: 'bar' });
    });
  });

  it('pre-populates the from useInitialValues hook if available', async () => {
    const useInitialValues = () => {
      const [values, setValues] = useState<FormikValues | undefined>(undefined);
      useEffect(() => {
        setTimeout(() => {
          setValues({ foo: 'foo' });
        }, 100);
      }, [setValues]);
      return values;
    };

    const Form = buildForm({ initialValues: { foo: '' }, useInitialValues });
    render(
      <Form>
        <Field type="text" name="foo" />
        <button type="submit" />
      </Form>,
    );
    const input = screen.getByRole('textbox');
    await waitFor(() => expect(input.getAttribute('value')).toEqual('foo'));
  });
});

describe('layoutArgsEnhancer', () => {
  it('renders placeholders in stories withing "Elements/Layouts"', () => {
    const story: LayoutStory<typeof PageLayout> = {
      args: {
        header: ['Header', 'indigo'],
        footer: ['Footer', 'blue'],
      },
    };
    const { container } = render(
      <PageLayout
        {...layoutArgsEnhancer({
          id: 'elements-layouts-page',
          initialArgs: story.args,
        } as any)}
      />,
    );
    expect(container).toMatchInlineSnapshot(`
          <div>
            <div>
              <header>
                <div
                  data-testid="header"
                  style="background-color: rgb(224, 231, 255); height: 200px; display: flex; align-items: center;"
                >
                  <div
                    style="text-align: center; width: 100%; font-style: italic; font-weight: bold; color: rgb(55, 65, 81);"
                  >
                    Header
                  </div>
                </div>
              </header>
              <main />
              <footer>
                <div
                  data-testid="footer"
                  style="background-color: rgb(219, 234, 254); height: 200px; display: flex; align-items: center;"
                >
                  <div
                    style="text-align: center; width: 100%; font-style: italic; font-weight: bold; color: rgb(55, 65, 81);"
                  >
                    Footer
                  </div>
                </div>
              </footer>
            </div>
          </div>
      `);
  });
});

describe('OrganismDecorator', () => {
  it('allows to pass a status code into an organism', () => {
    const { container } = render(
      OrganismDecorator((props) => <AsyncContent Content={props.Content} />, {
        parameters: {
          useMockedBehaviour(args) {
            return [args, 102];
          },
        },
      } as any),
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <p>
          Loading ...
        </p>
      </div>
    `);
  });
});

describe('renderRouteStory', () => {
  it('can render a simple route', () => {
    const IntroStory: OrganismStory<typeof ContentHeader> = {
      args: {
        title: 'Foo',
      },
    };
    const SyncContentStory: OrganismStory<typeof SyncContent> = {
      args: {
        Content: buildHtml('<p>Sync content</p>'),
      },
    };

    const RouteStory: RouteStory<typeof Content> = {
      render: renderRouteStory(Content),
      args: {
        intro: IntroStory,
        body: [
          {
            key: 'sync',
            story: SyncContentStory,
          },
        ],
      },
    };
    const { container } = render(<RouteStory.render {...RouteStory.args} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Foo
            </h1>
          </div>
          <div>
            <p>
              Sync content
            </p>
          </div>
        </div>
      </div>
    `);
  });

  it('allows to mock behaviour with hooks', () => {
    const IntroStory: OrganismStory<typeof ContentHeader> = {
      args: {
        title: 'Foo',
      },
    };
    const AsyncContentStory: OrganismStory<typeof AsyncContent> = {
      args: {
        Content: buildHtml('<p>Async content</p>'),
      },
      parameters: {
        useMockedBehaviour(args) {
          return [args, 102];
        },
      },
    };

    const RouteStory: RouteStory<typeof Content> = {
      render: renderRouteStory(Content),
      args: {
        intro: IntroStory,
        body: [
          {
            key: 'async',
            story: AsyncContentStory,
          },
        ],
      },
    };
    const { container } = render(<RouteStory.render {...RouteStory.args} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Foo
            </h1>
          </div>
          <div>
            <p>
              Loading ...
            </p>
          </div>
        </div>
      </div>
    `);
  });

  it('renders nested stories', () => {
    const HeaderStory: OrganismStory<typeof Header> = { args: {} };
    const FooterStory: OrganismStory<typeof Footer> = { args: {} };
    const PageStory: RouteStory<typeof Page> = {
      render: renderRouteStory(Page),
      args: {
        header: HeaderStory,
        footer: FooterStory,
      },
    };

    const IntroStory: OrganismStory<typeof ContentHeader> = {
      args: {
        title: 'Foo',
      },
    };
    const SyncContentStory: OrganismStory<typeof SyncContent> = {
      args: {
        Content: buildHtml('<p>Sync content</p>'),
      },
    };

    const RouteStory: RouteStory<typeof Content> = {
      render: renderRouteStory(Content, PageStory),
      args: {
        intro: IntroStory,
        body: [
          {
            key: 'sync',
            story: SyncContentStory,
          },
        ],
      },
    };

    const { container } = render(<RouteStory.render {...RouteStory.args} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <header>
            <div>
              Header
            </div>
          </header>
          <main>
            <div>
              <div>
                <h1>
                  Foo
                </h1>
              </div>
              <div>
                <p>
                  Sync content
                </p>
              </div>
            </div>
          </main>
          <footer>
            <div>
              Footer
            </div>
          </footer>
        </div>
      </div>
    `);
  });
});
