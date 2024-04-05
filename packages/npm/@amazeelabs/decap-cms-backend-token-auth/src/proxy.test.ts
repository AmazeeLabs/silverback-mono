import { describe, expect, it, vi } from 'vitest';

import { githubProxy } from './proxy.js';

const fetch = vi.fn();
global.fetch = fetch;

describe('createGithubProxy', () => {
  it('passes requests to github and returns the response', async () => {
    fetch.mockReturnValue(
      new Response(
        JSON.stringify({
          url: 'https://api.github.com/repos',
        }),
        { status: 200 },
      ),
    );
    const request = new Request('https://mysite.com/_github/repos');
    const result = await githubProxy(request, 'token', '/_github');
    expect(fetch).toHaveBeenCalledWith('https://api.github.com/repos', {
      method: 'GET',
      body: null,
      duplex: 'half',
      headers: {
        ...request.headers,
        Authorization: 'Bearer token',
      },
    });
    expect(await result.text()).toBe(
      JSON.stringify({
        url: 'https://mysite.com/_github/repos',
      }),
    );
  });
  it('handles 204 requests', async () => {
    fetch.mockReturnValue(new Response(null, { status: 204 }));
    const request = new Request('https://mysite.com/_github/merge', {
      method: 'POST',
      body: null,
    });
    const result = await githubProxy(request, 'token', '/_github');
    expect(fetch).toHaveBeenCalledWith('https://api.github.com/merge', {
      method: 'POST',
      body: null,
      duplex: 'half',
      headers: {
        ...request.headers,
        Authorization: 'Bearer token',
      },
    });
    expect(result.status).toBe(204);
    expect(result.body).toBe(null);
  });
});
