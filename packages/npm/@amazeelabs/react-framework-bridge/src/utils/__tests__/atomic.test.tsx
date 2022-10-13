import { act, render } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand';

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
    vi.useFakeTimers();
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
    vi.runAllTimers();
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
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('catches errors on organism level during mapping', () => {
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
              input: () => {
                throw new Error('Error while mapping organism.');
                return [
                  {
                    Content: buildHtml(`<p>Async content.</p>`),
                  },
                  102,
                ] as [any, number];
              },
            },
            {
              key: 'sync',
              input: () =>
                [
                  {
                    Content: buildHtml(`<p>Sync content.</p>`),
                  },
                  200,
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
            <div
              class="uncaught-error"
            >
              <p>
                An error happened while rendering organism.
              </p>
              <p>
                Error while mapping organism.
              </p>
            </div>
            <p>
              Sync content.
            </p>
          </div>
        </div>
      </div>
    `);
  });

  it('catches errors on organism level during rendering', () => {
    const { container } = render(
      <Route
        definition={Content}
        input={{
          intro: {
            title: 'Test',
          },
          body: [
            {
              key: 'error',
              input: () => {
                return [
                  {
                    Content: buildHtml(`<p>Async content.</p>`),
                  },
                  102,
                ] as [any, number];
              },
            },
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
            <div
              class="uncaught-error"
            >
              <p>
                An error happened while rendering organism.
              </p>
              <p>
                Error while rendering organism.
              </p>
            </div>
            <p>
              Loading ...
            </p>
          </div>
        </div>
      </div>
    `);
  });

  it('allows to pass zustand stores into organisms', () => {
    const store = createStore(() => ({
      x: 'Foo',
      y: 0,
    }));
    const { container } = render(
      <Route
        definition={Content}
        intl={{ defaultLocale: 'en', locale: 'en' }}
        input={{
          intro: { title: 'Dynamic' },
          body: [
            {
              key: 'dynamic',
              input: {
                dynamicData: store,
              },
            },
          ],
        }}
      />,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Dynamic
            </h1>
          </div>
          <div>
            <p>
              Foo
            </p>
          </div>
        </div>
      </div>
    `);
  });

  it('updates organisms based on store changes', async () => {
    vi.useFakeTimers();

    type Store = {
      x: string;
      y: number;
      swap: () => void;
    };

    const store = createStore<Store>((set) => ({
      x: 'Foo',
      y: 0,
      swap: () => set({ x: 'Bar' }),
    }));

    setTimeout(() => {
      act(() => {
        store.getState().swap();
      });
    }, 50);

    const { container } = render(
      <Route
        definition={Content}
        intl={{ defaultLocale: 'en', locale: 'en' }}
        input={{
          intro: { title: 'Dynamic' },
          body: [
            {
              key: 'dynamic',
              input: {
                dynamicData: store,
              },
            },
          ],
        }}
      />,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Dynamic
            </h1>
          </div>
          <div>
            <p>
              Foo
            </p>
          </div>
        </div>
      </div>
    `);
    vi.runAllTimers();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div>
            <h1>
              Dynamic
            </h1>
          </div>
          <div>
            <p>
              Bar
            </p>
          </div>
        </div>
      </div>
    `);
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
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

    type Input = Array<SyncFragment | AsyncFragment | undefined>;

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
      [
        {
          "input": {
            "Content": [Function],
          },
          "key": "sync",
        },
        {
          "input": {
            "Content": [Function],
          },
          "key": "async",
        },
        {
          "input": {
            "Content": [Function],
          },
          "key": "sync",
        },
        {
          "input": {
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
    type Input = Array<Html | undefined>;
    const mappingFunction = vi.fn();
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
      [
        {
          "input": {
            "Content": [Function],
          },
          "key": "sync",
        },
        {
          "input": {
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
