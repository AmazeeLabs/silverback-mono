import { render } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';

import { buildHtml } from '../../storybook';
import { createMapper, Route, RouteInput } from '../atomic';
import { Content, Page } from '../example-ui';

describe('Route rendering', () => {
  it('can render a simple route without children', async () => {
    const { container } = render(
      <Route
        definition={Page}
        input={{
          header: {},
          footer: {},
        }}
        intl={{ defaultLocale: 'en', locale: 'en' }}
      />,
    );
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            <header>
              <div>
                Header
              </div>
            </header>
            <main />
            <footer>
              <div>
                Footer
              </div>
            </footer>
          </div>
        </div>
      `);
  });

  it('can render a simple route with children', async () => {
    const { container } = render(
      <Route
        definition={Page}
        input={{
          header: {},
          footer: {},
        }}
        intl={{ defaultLocale: 'en', locale: 'en' }}
      >
        <p>Content</p>
      </Route>,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <header>
            <div>
              Header
            </div>
          </header>
          <main>
            <p>
              Content
            </p>
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

  it('can render nested routes', async () => {
    const { container } = render(
      <Route
        definition={Page}
        input={{
          header: {},
          footer: {},
        }}
        intl={{ defaultLocale: 'en', locale: 'en' }}
      >
        <Route
          definition={Content}
          input={{
            intro: {
              title: 'Test',
            },
            body: [
              {
                key: 'sync',
                input: {
                  Content: buildHtml(`<p>Test content paragraph.</p>`),
                },
              },
            ],
          }}
          intl={{ defaultLocale: 'en', locale: 'en' }}
        />
      </Route>,
    );
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
                  Test
                </h1>
              </div>
              <div>
                <p>
                  Test content paragraph.
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

  it('assumes status 200 for async organisms by default', async () => {
    const { container } = render(
      <Route
        definition={Content}
        input={{
          intro: {
            title: 'Test',
          },
          body: [
            {
              key: 'async',
              input: {
                Content: buildHtml(`<p>Async content.</p>`),
              },
            },
          ],
        }}
        intl={{ defaultLocale: 'en', locale: 'en' }}
      />,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Test
            </h1>
          </div>
          <div>
            <p>
              Async content.
            </p>
          </div>
        </div>
      </div>
    `);
  });

  it('accepts hooks as input', async () => {
    const { container } = render(
      <Route
        definition={Content}
        input={{
          intro: {
            title: 'Test',
          },
          body: [
            {
              key: 'async',
              input: () => [
                {
                  Content: buildHtml(`<p>Async content.</p>`),
                },
                102,
              ],
            },
          ],
        }}
        intl={{ defaultLocale: 'en', locale: 'en' }}
      />,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Test
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

  it('updates organisms based on hook output', async () => {
    await act(async () => {
      const { container } = render(
        <Route
          definition={Content}
          input={{
            intro: {
              title: 'Test',
            },
            body: [
              {
                key: 'async',
                input: function useAsyncInput() {
                  const [status, setStatus] = useState(102);
                  useEffect(() => {
                    setTimeout(() => setStatus(200), 50);
                  });
                  return [
                    {
                      Content: buildHtml(`<p>Async content.</p>`),
                    },
                    status,
                  ];
                },
              },
            ],
          }}
          intl={{ defaultLocale: 'en', locale: 'en' }}
        />,
      );
      expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Test
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
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Test
            </h1>
          </div>
          <div>
            <p>
              Async content.
            </p>
          </div>
        </div>
      </div>
    `);
    });
  });
});

describe('createMapper', () => {
  it('allows to define mapping functions for page elements', () => {
    type SyncFragment = {
      __typename: 'Sync';
      html: string;
    };
    type AsyncFragment = {
      __typename: 'Async';
      html: string;
    };
    const map = (
      input: SyncFragment | AsyncFragment,
    ): RouteInput<typeof Content, 'body', 'sync' | 'async'> => ({
      key: input.__typename === 'Sync' ? 'sync' : 'async',
      input: {
        Content: buildHtml(
          `<div class="${input.__typename === 'Sync' ? 'sync' : 'async'}">${
            input.html
          }</div>`,
        ),
      },
    });

    type Input = Array<SyncFragment | AsyncFragment>;

    const mapper = createMapper<Input, RouteInput<typeof Content, 'body'>>({
      Sync: map,
      Async: map,
    });

    const input: Input = [
      {
        __typename: 'Sync',
        html: 'Sync content 1',
      },
      {
        __typename: 'Async',
        html: 'Async content 1',
      },
      {
        __typename: 'Sync',
        html: 'Sync content 2',
      },
      {
        __typename: 'Async',
        html: 'Async content 2',
      },
    ];
    expect(mapper(input)).toMatchInlineSnapshot(`
      Array [
        Object {
          "input": Object {
            "Content": [Function],
          },
          "key": "sync",
        },
        Object {
          "input": Object {
            "Content": [Function],
          },
          "key": "async",
        },
        Object {
          "input": Object {
            "Content": [Function],
          },
          "key": "sync",
        },
        Object {
          "input": Object {
            "Content": [Function],
          },
          "key": "async",
        },
      ]
    `);
  });
});
