import { cleanup, render } from '@testing-library/react';
import * as ReactDomServer from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ErrorPicture,
  Image,
  LoadingPicture,
  ReadyPicture,
  useImageContext,
} from './Image';

const CustomPlaceholder = () => {
  const { state } = useImageContext();
  switch (state) {
    case 'loading':
      return <div>🚏 Loading...</div>;
    case 'error':
      return <div>💣 Error!</div>;
    default:
      return <div>😝 This should never be visible.</div>;
  }
};

afterEach(cleanup);

describe('Image', () => {
  it('renders a fluid responsive image', () => {
    const screen = render(
      <Image
        alt="Alt text"
        src="/test.jpg"
        width={400}
        height={300}
        Picture={ReadyPicture}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class=""
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('renders a fixed height responsive image', () => {
    const screen = render(
      <Image
        alt="Alt text"
        src="/test.jpg"
        width={400}
        height={300}
        layout="cover"
        Picture={ReadyPicture}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; height: 100%;"
          >
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class=""
                height="300"
                loading="lazy"
                src="/test.jpg"
                style="object-fit: cover; height: 100%;"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('adds a rendered class before the image is hydrated', () => {
    const output = ReactDomServer.renderToString(
      <Image
        width={400}
        height={300}
        alt="Alt text"
        src="/test.jpg"
        className={'always-class'}
        readyClassName={'ready-class'}
        renderedClassName={'rendered-class'}
      />,
    );
    expect(output).toMatchInlineSnapshot('"<div style=\\"position:relative;padding-bottom:75%\\"><picture style=\\"position:absolute;top:0;left:0;bottom:0;right:0\\"><img loading=\\"lazy\\" alt=\\"Alt text\\" width=\\"400\\" height=\\"300\\" src=\\"/test.jpg\\" class=\\"always-class rendered-class\\"/></picture></div>"');
  });

  it('adds a ready class when the image is loaded', () => {
    const screen = render(
      <Image
        width={400}
        height={300}
        alt="Alt text"
        src="/test.jpg"
        Picture={ReadyPicture}
        className={'always-class'}
        readyClassName={'ready-class'}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class="always-class ready-class"
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('adds a loading class when the image is loading', () => {
    const screen = render(
      <Image
        width={400}
        height={300}
        alt="Alt text"
        src="/test.jpg"
        Picture={LoadingPicture}
        className={'always-class'}
        readyClassName={'ready-class'}
        loadingClassName={'loading-class'}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <div
              aria-hidden="true"
              style="position: absolute;"
            >
              <div
                style="display: flex; align-items: center; width: 100%; height: 100%;"
              >
                <div
                  style="text-align: center; width: 100%;"
                >
                  Alt text
                </div>
              </div>
            </div>
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class="always-class loading-class"
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('adds a error class when the image is not available', () => {
    const screen = render(
      <Image
        width={400}
        height={300}
        alt="Alt text"
        src="/test.jpg"
        Picture={ErrorPicture}
        className={'always-class'}
        readyClassName={'ready-class'}
        loadingClassName={'loading-class'}
        errorClassName={'error-class'}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <div
              aria-hidden="true"
              style="position: absolute;"
            >
              <div
                style="display: flex; align-items: center; width: 100%; height: 100%;"
              >
                <div
                  style="text-align: center; width: 100%;"
                >
                  Alt text
                </div>
              </div>
            </div>
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class="always-class error-class"
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('shows the default placeholder for loading images', () => {
    const screen = render(
      <Image
        alt="Alt text"
        src="/test.jpg"
        width={400}
        height={300}
        Picture={LoadingPicture}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <div
              aria-hidden="true"
              style="position: absolute;"
            >
              <div
                style="display: flex; align-items: center; width: 100%; height: 100%;"
              >
                <div
                  style="text-align: center; width: 100%;"
                >
                  Alt text
                </div>
              </div>
            </div>
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class=""
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('shows the default placeholder for error images', () => {
    const screen = render(
      <Image
        alt="Alt text"
        src="/test.jpg"
        width={400}
        height={300}
        Picture={ErrorPicture}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <div
              aria-hidden="true"
              style="position: absolute;"
            >
              <div
                style="display: flex; align-items: center; width: 100%; height: 100%;"
              >
                <div
                  style="text-align: center; width: 100%;"
                >
                  Alt text
                </div>
              </div>
            </div>
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class=""
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('shows a custom placeholder for loading images', () => {
    const screen = render(
      <Image
        alt="Alt text"
        src="/test.jpg"
        width={400}
        height={300}
        Picture={LoadingPicture}
      >
        <CustomPlaceholder />
      </Image>,
    );

    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <div
              aria-hidden="true"
              style="position: absolute;"
            >
              <div>
                🚏 Loading...
              </div>
            </div>
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class=""
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('shows a custom placeholder for error images', () => {
    const screen = render(
      <Image
        alt="Alt text"
        src="/test.jpg"
        width={400}
        height={300}
        Picture={ErrorPicture}
      >
        <CustomPlaceholder />
      </Image>,
    );

    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <div
              aria-hidden="true"
              style="position: absolute;"
            >
              <div>
                💣 Error!
              </div>
            </div>
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <img
                alt="Alt text"
                class=""
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('allows to set sourceset and sizes for image', () => {
    const screen = render(
      <Image
        alt="Alt text"
        src="/test.jpg"
        width={400}
        height={300}
        sizes={[['(max-width: 400px)', '100vw'], '400px']}
        srcSet={[
          ['test.s.jpg', 400],
          ['test.l.jpg', 800],
        ]}
        Picture={ReadyPicture}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <source
                sizes="(max-width: 400px) 100vw, 400px"
                srcset="test.s.jpg 400w, test.l.jpg 800w"
              />
              <img
                alt="Alt text"
                class=""
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });

  it('allows to add alternative sources with their own sourcesets', () => {
    const screen = render(
      <Image
        alt="Alt text"
        src="/test.jpg"
        width={400}
        height={300}
        Picture={ReadyPicture}
        sizes={[['(max-width: 400px)', '100vw'], '400px']}
        sources={[
          {
            media: '(min-width: 800px)',
            srcSet: [
              ['test.s.jpg', 400],
              ['test.l.jpg', 800],
            ],
          },
        ]}
      />,
    );
    expect(screen.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            style="position: relative; padding-bottom: 75%;"
          >
            <picture
              style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"
            >
              <source
                media="(min-width: 800px)"
                sizes="(max-width: 400px) 100vw, 400px"
                srcset="test.s.jpg 400w, test.l.jpg 800w"
              />
              <img
                alt="Alt text"
                class=""
                height="300"
                loading="lazy"
                src="/test.jpg"
                width="400"
              />
            </picture>
          </div>
        </div>
      </body>
    `);
  });
});
