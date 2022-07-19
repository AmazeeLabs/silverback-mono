import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form, Formik, FormikValues } from 'formik';
import React, { useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';

import { type } from '../../test-utils';
import { Link, LinkProps } from '../../types';
import {
  buildHtmlBuilder,
  buildUrl,
  FormikChanges,
  FormikInitialValues,
  isElement,
  isRelative,
} from '../';

describe('isRelative', () => {
  it('returns true for a relative url', () => {
    expect(isRelative('/test')).toBeTruthy();
  });
  it('returns true for a hash url', () => {
    expect(isRelative('#hash')).toBeTruthy();
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
  Element.href = href || '';
  return Element;
};

const buildHtml = buildHtmlBuilder(buildLink);

describe('buildHtmlBuilder', () => {
  beforeEach(jest.resetAllMocks);

  it('renders a simple paragraph', () => {
    const htmlString = '<main><p>Test</p></main>';
    const Html = buildHtml(htmlString);
    expect(Html.initialHtmlString).toEqual(htmlString);
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

  it('adds classes and ids to h2 elements', () => {
    const Html = buildHtml(
      '<main><h2>Test <strong>strong</strong></h2></main>',
    );
    render(
      <Html
        classNames={{
          h2: 'foo',
        }}
      />,
    );
    expect(screen.getByRole('main')).toMatchInlineSnapshot(`
      <main>
        <h2
          class="foo"
          id="test-strong"
        >
          Test 
          <strong>
            strong
          </strong>
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

describe('buildUrl', () => {
  it('allows to create a root url to /', () => {
    expect(buildUrl(['/'])).toStrictEqual(`/`);
  });
  it('allows to create a url from segments starting with /', () => {
    expect(buildUrl(['/', 'foo', 'bar'])).toStrictEqual(`/foo/bar`);
  });
  it('concatenates segments', () => {
    expect(buildUrl(['https://fake.url/', 'a', 'b'])).toStrictEqual(
      `https://fake.url/a/b`,
    );
  });
  it('filters out falsy segments', () => {
    expect(
      buildUrl(['https://fake.url/', 'a', null, 'b', undefined, 'c']),
    ).toStrictEqual(`https://fake.url/a/b/c`);
  });
  it('sanitizes segments', () => {
    expect(
      buildUrl(['https://fake.url///', '/a', 'b//', '///c']),
    ).toStrictEqual(`https://fake.url/a/b/c`);
  });
  it('can handle query string parameters', () => {
    expect(
      buildUrl(['https://fake.url/', 'a', 'b'], {
        first: 'value',
        second: true,
        third: 32,
        fourth: ['a', 2, null],
        fifth: {
          a: 'value',
          2: true,
        },
        sixth: undefined,
        seventh: null,
      }),
    ).toStrictEqual(
      `https://fake.url/a/b?${encodeURI(
        'first=value&second=true&third=32&fourth[0]=a&fourth[1]=2&fifth[2]=true&fifth[a]=value',
      )}`,
    );
  });
  it('can create query urls without paths', () => {
    expect(
      buildUrl(undefined, {
        first: 'value',
        second: true,
        third: 32,
        fourth: ['a', 2, null],
        fifth: {
          a: 'value',
          2: true,
        },
        sixth: undefined,
        seventh: null,
      }),
    ).toStrictEqual(
      `?${encodeURI(
        'first=value&second=true&third=32&fourth[0]=a&fourth[1]=2&fifth[2]=true&fifth[a]=value',
      )}`,
    );
  });
  it('builds relative urls', () => {
    expect(buildUrl(['/first//', '//second/', 'third'])).toStrictEqual(
      '/first/second/third',
    );
  });
  it('sanitizes leading/trailing slashes', () => {
    expect(buildUrl(['/first//', '//second/', 'third//'])).toStrictEqual(
      '/first/second/third',
    );
  });
  it('attaches a fragment', () => {
    expect(
      buildUrl(['https://fake.url/', 'a', 'b'], undefined, undefined, 'foo'),
    ).toStrictEqual(`https://fake.url/a/b#foo`);
  });
});

describe('FormikChanges', () => {
  it('emits form value changes via "onChange"', async () => {
    const onChange = jest.fn();
    render(
      <Formik initialValues={{ query: '' }} onSubmit={() => {}}>
        <Form>
          <FormikChanges onChange={onChange} />
          <label>
            Query
            <Field type="text" name="query" />
          </label>
        </Form>
      </Formik>,
    );
    const input = await screen.findByRole('textbox');

    await type(input, 'foo');
    await userEvent.clear(input);
    await type(input, 'bar');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(8);
      expect(onChange).toHaveBeenNthCalledWith(1, { query: '' });
      expect(onChange).toHaveBeenNthCalledWith(2, { query: 'f' });
      expect(onChange).toHaveBeenNthCalledWith(3, { query: 'fo' });
      expect(onChange).toHaveBeenNthCalledWith(4, { query: 'foo' });
      expect(onChange).toHaveBeenNthCalledWith(5, { query: '' });
      expect(onChange).toHaveBeenNthCalledWith(6, { query: 'b' });
      expect(onChange).toHaveBeenNthCalledWith(7, { query: 'ba' });
      expect(onChange).toHaveBeenNthCalledWith(8, { query: 'bar' });
    });
  });
});

describe('FormikInitialValues', () => {
  it('does nothing when the hook returns undefined', async () => {
    await act(async () => {
      render(
        <Formik initialValues={{ a: '', b: '' }} onSubmit={() => {}}>
          <Form>
            <FormikInitialValues useInitialValues={() => undefined} />
            <label>
              A
              <Field type="text" name="a" />
            </label>
            <label>
              B
              <Field type="text" name="b" />
            </label>
          </Form>
        </Formik>,
      );
    });
    const a = await screen.findByRole('textbox', { name: 'A' });
    const b = await screen.findByRole('textbox', { name: 'B' });
    expect(a.getAttribute('value')).toEqual('');
    expect(b.getAttribute('value')).toEqual('');
  });

  it('does nothing when the hook returns an empty object', async () => {
    await act(async () => {
      render(
        <Formik initialValues={{ a: '', b: '' }} onSubmit={() => {}}>
          <Form>
            <FormikInitialValues useInitialValues={() => ({})} />
            <label>
              A
              <Field type="text" name="a" />
            </label>
            <label>
              B
              <Field type="text" name="b" />
            </label>
          </Form>
        </Formik>,
      );
    });
    const a = await screen.findByRole('textbox', { name: 'A' });
    const b = await screen.findByRole('textbox', { name: 'B' });
    expect(a.getAttribute('value')).toEqual('');
    expect(b.getAttribute('value')).toEqual('');
  });

  it('sets a value when the hook returns an a value', async () => {
    await act(async () => {
      render(
        <Formik initialValues={{ a: '', b: '' }} onSubmit={() => {}}>
          <Form>
            <FormikInitialValues useInitialValues={() => ({ a: 'foo' })} />
            <label>
              A
              <Field type="text" name="a" />
            </label>
            <label>
              B
              <Field type="text" name="b" />
            </label>
          </Form>
        </Formik>,
      );
    });
    const a = await screen.findByRole('textbox', { name: 'A' });
    const b = await screen.findByRole('textbox', { name: 'B' });
    expect(a.getAttribute('value')).toEqual('foo');
    expect(b.getAttribute('value')).toEqual('');
  });

  it('sets a value when the hook returns an a value a little later', async () => {
    await act(async () => {
      const useInitialValues = () => {
        const [values, setValues] = useState<FormikValues | undefined>(
          undefined,
        );
        useEffect(() => {
          setTimeout(() => {
            setValues({ a: 'foo' });
          }, 100);
        }, [setValues]);
        return values;
      };

      render(
        <Formik initialValues={{ a: '', b: '' }} onSubmit={() => {}}>
          <Form>
            <FormikInitialValues useInitialValues={useInitialValues} />
            <label>
              A
              <Field type="text" name="a" />
            </label>
            <label>
              B
              <Field type="text" name="b" />
            </label>
          </Form>
        </Formik>,
      );
    });

    const a = await screen.findByRole('textbox', { name: 'A' });
    const b = await screen.findByRole('textbox', { name: 'B' });
    await waitFor(() => expect(a.getAttribute('value')).toEqual('foo'));
    await waitFor(() => expect(b.getAttribute('value')).toEqual(''));
  });

  it('does not overwrite a value that has already been set', async () => {
    await act(async () => {
      const useInitialValues = () => {
        const [values, setValues] = useState<FormikValues | undefined>(
          undefined,
        );
        useEffect(() => {
          setTimeout(() => {
            setValues({ a: 'foo' });
          }, 100);
          setTimeout(() => {
            setValues({ a: 'bar' });
          }, 150);
        }, [setValues]);
        return values;
      };

      render(
        <Formik initialValues={{ a: '', b: '' }} onSubmit={() => {}}>
          <Form>
            <FormikInitialValues useInitialValues={useInitialValues} />
            <label>
              A
              <Field type="text" name="a" />
            </label>
            <label>
              B
              <Field type="text" name="b" />
            </label>
          </Form>
        </Formik>,
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    const a = await screen.findByRole('textbox', { name: 'A' });
    const b = await screen.findByRole('textbox', { name: 'B' });

    await waitFor(() => expect(a.getAttribute('value')).toEqual('foo'));
    await waitFor(() => expect(b.getAttribute('value')).toEqual(''));
  });

  it('does not overwrite a value that has been modified', async () => {
    await act(async () => {
      const useInitialValues = () => {
        const [values, setValues] = useState<FormikValues | undefined>(
          undefined,
        );
        useEffect(() => {
          setTimeout(() => {
            act(() => {
              setValues({ a: 'foo' });
            });
          }, 150);
        }, [setValues]);
        return values;
      };
      render(
        <Formik initialValues={{ a: '', b: '' }} onSubmit={() => {}}>
          <Form>
            <FormikInitialValues useInitialValues={useInitialValues} />
            <label>
              A
              <Field type="text" name="a" />
            </label>
            <label>
              B
              <Field type="text" name="b" />
            </label>
          </Form>
        </Formik>,
      );
    });

    const a = await screen.findByRole('textbox', { name: 'A' });
    const b = await screen.findByRole('textbox', { name: 'B' });

    await userEvent.type(a, 'bar');
    await userEvent.type(b, 'baz');

    await waitFor(() => expect(a.getAttribute('value')).toEqual('bar'));
    await waitFor(() => expect(b.getAttribute('value')).toEqual('baz'));

    await new Promise((resolve) => setTimeout(resolve, 200));

    await waitFor(() => expect(a.getAttribute('value')).toEqual('bar'));
    await waitFor(() => expect(b.getAttribute('value')).toEqual('baz'));
  });
});
