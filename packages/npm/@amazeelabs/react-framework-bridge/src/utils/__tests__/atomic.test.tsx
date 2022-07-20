import { act, render } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

import { buildHtml } from '../../storybook';
import { createMapper, Route, RouteSlotInput } from '../atomic';
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

  it('can render content groups within an organism', async () => {
    const { container } = render(
      <Route
        definition={Content}
        input={{
          intro: {
            title: 'Test',
          },
          body: [
            {
              key: 'group',
              input: {
                title: 'Test Group',
                content: {
                  items: [
                    {
                      key: 'sync',
                      input: {
                        Content: buildHtml(`<p>Sync content.</p>`),
                      },
                    },
                    {
                      key: 'async',
                      input: {
                        Content: buildHtml(`<p>Async content.</p>`),
                      },
                    },
                  ],
                },
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
            <div>
              <h2>
                Test Group
              </h2>
              <p>
                Sync content.
              </p>
              <p>
                Async content.
              </p>
            </div>
          </div>
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
              input: () =>
                [
                  {
                    Content: buildHtml(`<p>Async content.</p>`),
                  },
                  102,
                ] as [any, number],
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
    jest.useFakeTimers();
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
                  setTimeout(() => {
                    act(() => {
                      setStatus(200);
                    });
                  }, 50);
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
    jest.runAllTimers();
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
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
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
    ): RouteSlotInput<typeof Content, 'body', 'sync' | 'async'> => ({
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

    const mapper = createMapper<Input, RouteSlotInput<typeof Content, 'body'>>({
      Sync: map,
      Async: map,
    });

    const input: Input = [
      {
        __typename: 'Sync',
        html: 'Sync content 1',
      },
      undefined,
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

  it('passes execution context and payloads into mapping functions', () => {
    type Html = {
      __typename: 'Sync';
      html: string;
    };
    type Input = Array<Html>;
    const mappingFunction = jest.fn();
    mappingFunction.mockReturnValue({
      key: 'sync',
      input: {
        Content: buildHtml(`<div class="sync">Foo</div>`),
      },
    });
    const mapper = createMapper<Input, RouteSlotInput<typeof Content, 'body'>>(
      {
        Sync: mappingFunction,
      },
      'some context',
    );

    const input: Input = [
      {
        __typename: 'Sync',
        html: 'Sync content 1',
      },
      undefined,
      {
        __typename: 'Sync',
        html: 'Sync content 2',
      },
    ];

    expect(mapper(input, 'some other context')).toMatchInlineSnapshot(`
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
          "key": "sync",
        },
      ]
    `);
    expect(mappingFunction).toHaveBeenCalledTimes(2);
    expect(mappingFunction).toHaveBeenNthCalledWith(1, input[0], {
      items: [input[0], input[2]],
      payload: 'some other context',
      index: 0,
    });
    expect(mappingFunction).toHaveBeenNthCalledWith(2, input[2], {
      items: [input[0], input[2]],
      payload: 'some other context',
      index: 1,
    });
  });
});
