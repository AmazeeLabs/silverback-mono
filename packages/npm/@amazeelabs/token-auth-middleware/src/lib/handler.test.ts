import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmailBackend } from './email-backend.js';
import { cookieHeader, metaRedirect, TokenAuthHandler } from './handler.js';
import { JwtEncoder } from './jwt-encoder.js';

beforeEach(() => {
  vi.resetAllMocks();
});

const delivery = vi.fn();

class MockedEmailBackend extends EmailBackend {
  async sendEmail(to: string, name: string, link: string): Promise<void> {
    delivery(to, name, link);
  }
}

describe('Token Auth Handler', () => {
  const encoder = new JwtEncoder('shhh');

  const backend = new MockedEmailBackend(
    {
      'bob@amazeelabs.dev': 'Bob',
    },
    'noreply@amazeelabs.com',
  );

  describe('arbitrary requests', () => {
    it('blocks non-html requests without authentication', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request('test:/resource/something'),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(401);
    });

    it('redirects to a standard login url', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request('test:/resource/something?a=b', {
          headers: {
            Accept: 'text/html',
          },
        }),
        async () => new Response(''),
      );
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        'test:/resource/___login?destination=test%3A%2Fresource%2Fsomething%3Fa%3Db',
      );
    });

    it('redirects html requests to the custom login url', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend, {
        customLogin: '/login',
      });
      const response = await handler.handle(
        new Request('test:/resource/something?a=b', {
          headers: {
            Accept: 'text/html',
          },
        }),
        async () => new Response(''),
      );
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        'test:/login?destination=test%3A%2Fresource%2Fsomething%3Fa%3Db',
      );
    });

    it('returns the proxied response if the session is valid', async () => {
      const sessionToken = await encoder.create('bob@amazeelabs.dev');
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request('test:/resource/something', {
          headers: {
            Cookie: `session=${sessionToken}`,
          },
        }),
        async () => new Response('restricted resource'),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('restricted resource');
    });
  });

  describe('login requests', () => {
    it('response with a login form if the request is a GET', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request(
          'test:/resource/___login?destination=test%3A%2Fresource%3Fa%3Db',
        ),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(200);
      expect(await response.text()).toContain('<form method="post">');
    });

    it('responds with "bad request" if the id is not set', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request(
          'test:/resource/___login?destination=test%3A%2Fresource%3Fa%3Db',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: new URLSearchParams(),
          },
        ),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(405);
    });

    it('shows a default notification', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const formData = new URLSearchParams();
      formData.append('id', 'idont@exist.com');
      const response = await handler.handle(
        new Request(
          'test:/resource/___login?destination=test%3A%2Fresource%3Fa%3Db',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: formData,
          },
        ),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(200);
      expect(await response.text()).toContain('<h1>Login link sent</h1>');
    });

    it('sends a login link', async () => {
      vi.setSystemTime(new Date('2024-01-01 00:00:00'));
      const handler = new TokenAuthHandler('/resource', encoder, backend, {
        tokenLifetime: 10,
      });
      const token = await encoder.create('bob@amazeelabs.dev', 10);
      const formData = new URLSearchParams();
      formData.append('id', 'bob@amazeelabs.dev');
      await handler.handle(
        new Request('test:/resource/___login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: formData,
        }),
        async () => new Response(''),
      );
      expect(delivery).toHaveBeenCalledWith(
        'bob@amazeelabs.dev',
        'Bob',
        `test:/resource/___auth?token=${token}`,
      );
    });

    it('sends a login link, retaining a destination parameter', async () => {
      vi.setSystemTime(new Date('2024-01-01 00:00:00'));
      const handler = new TokenAuthHandler('/resource', encoder, backend, {
        tokenLifetime: 10,
      });
      const token = await encoder.create('bob@amazeelabs.dev', 10);
      const formData = new URLSearchParams();
      formData.append('id', 'bob@amazeelabs.dev');
      await handler.handle(
        new Request(
          'test:/resource/___login?destination=' +
            encodeURIComponent('test:/resource/something?a=b'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: formData,
          },
        ),
        async () => new Response(''),
      );
      expect(delivery).toHaveBeenCalledWith(
        'bob@amazeelabs.dev',
        'Bob',
        `test:/resource/___auth?destination=test%3A%2Fresource%2Fsomething%3Fa%3Db&token=${token}`,
      );
    });
  });

  describe('authentication requests', () => {
    it('returns 401 if the token is invalid', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request('test:/resource/___auth?token=invalid'),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(401);
    });

    it('writes a cookie on successful authentication', async () => {
      vi.setSystemTime(new Date('2024-01-01 00:00:00'));
      const token = await encoder.create('bob@amazeelabs.dev', 60);
      const sessionToken = await encoder.create('bob@amazeelabs.dev');
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request(`test:/resource/___auth?token=${token}`),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(200);
      expect(await response.text()).toEqual(
        metaRedirect('Login successful', '/resource'),
      );
      expect(response.headers.get('Set-Cookie')).toEqual(
        cookieHeader(sessionToken, '/resource'),
      );
    });

    it('redirects to the destination', async () => {
      vi.setSystemTime(new Date('2024-01-01 00:00:00'));
      const token = await encoder.create('bob@amazeelabs.dev', 60);
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request(
          `test:/resource/___auth?destination=test%3A%2Fresource%2Fsomething%3Fa%3Db&token=${token}`,
        ),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(200);
      expect(await response.text()).toEqual(
        metaRedirect('Login successful', 'test:/resource/something?a=b'),
      );
    });

    it('ignores a destination on a different host', async () => {
      vi.setSystemTime(new Date('2024-01-01 00:00:00'));
      const token = await encoder.create('bob@amazeelabs.dev', 60);
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request(
          `test:/resource/___auth?destination=https%3A%2F%2Fhacker.com&token=${token}`,
        ),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(200);
      expect(await response.text()).toEqual(
        metaRedirect('Login successful', '/resource'),
      );
    });
  });

  describe('status requests', () => {
    it('returns 401 if the session is invalid', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request('test:/resource/___status'),
        async () => new Response(''),
      );
      expect(response.status).toBe(401);
    });

    it('returns the user information if the session is valid', async () => {
      const sessionToken = await encoder.create('bob@amazeelabs.dev');
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request('test:/resource/___status', {
          headers: {
            Cookie: cookieHeader(sessionToken, '/resource'),
          },
        }),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(await response.json()).toEqual({
        token: sessionToken,
        id: 'bob@amazeelabs.dev',
        name: 'Bob',
      });
    });
  });

  describe('logout requests', () => {
    it('returns 405 if the request is not a POST', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend);
      const response = await handler.handle(
        new Request('test:/resource/___logout', {
          headers: {
            Referer: 'test:/resource/',
          },
        }),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('public');
      expect(response.status).toBe(405);
    });

    it('clears the session cookie and redirects to login', async () => {
      const handler = new TokenAuthHandler('/resource', encoder, backend, {
        customLogin: 'test:/login',
      });
      const response = await handler.handle(
        new Request('test:/resource/___logout', {
          method: 'POST',
          headers: {
            Referer: 'test:/resource/',
          },
        }),
        async () => new Response(''),
      );
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.status).toBe(200);
      expect(await response.text()).toEqual(
        metaRedirect('Logged out', 'test:/login'),
      );
      expect(response.headers.get('Set-Cookie')).toEqual(
        cookieHeader('', '/resource'),
      );
    });
  });
});
