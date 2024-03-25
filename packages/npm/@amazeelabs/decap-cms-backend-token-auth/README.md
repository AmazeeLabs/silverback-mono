# Decap Token-Auth backend

Decap backend that uses token authentication instead of Netlify Identity or
similar services. This package is meant to be used in combination with the
`@amazeelabs/token-auth-middleware` package. It contains a proxy service that
can run as a serverless function and handle Decap requests with a dedicated
Github token.

## Usage

First, create a serverless function that uses the `githubProxy` function to
create a handler that will pass requests to Github.

```typescript
// netlify/functions/github-proxy.mts
import type { Context, Config } from '@netlify/functions';
import { githubProxy } from '@amazeelabs/decap-cms-backend-token-auth/proxy';

export default function (request: Request, context: Context) {
  if (!process.env.DECAP_GITHUB_TOKEN) {
    throw new Error('Missing environment variable DECAP_GITHUB_TOKEN.');
  }
  return githubProxy(
    request,
    process.env.DECAP_GITHUB_TOKEN,
    '/.netlify/functions/github-proxy',
  );
}
```

By default, the proxy will be available at `/.netlify/functions/github-proxy`.
Protect this path using
[Token auth middleware](../token-auth-middleware/README.md).

```typescript
// netlify/edge-functions/github-proxy-auth.ts
import type { Context } from '@netlify/edge-functions';

// For some reason pnpm package imports break in edge handlers.
import {
  JwtEncoder,
  PostmarkEmailBackend,
  TokenAuthHandler,
} from '../../node_modules/@amazeelabs/token-auth-middleware/build/index.js';

export default async (request: Request, context: Context) => {
  if (
    !(Netlify.env.has('JWT_SECRET') && Netlify.env.has('POSTMARK_API_TOKEN'))
  ) {
    throw new Error(
      'Missing environment variables JWT_SECRET and POSTMARK_API_TOKEN.',
    );
  }

  const encoder = new JwtEncoder(Netlify.env.get('JWT_SECRET') as string);
  const backend = new PostmarkEmailBackend(
    {
      // Grant access to everybody @amazeelabs.com.
      '*@amazeelabs.com': '*',
    },
    'noreply@amazeelabs.com',
    Netlify.env.get('POSTMARK_API_TOKEN') as string,
    'login-link',
  );

  const handler = new TokenAuthHandler(
    '/.netlify/functions/github-proxy',
    encoder,
    backend,
    {
      tokenLifetime: 300,
    },
  );
  return handler.handle(request, context.next);
};
```

> [!IMPORTANT]  
> Make sure to configure the middleware covers the whole api path:

```toml
[[edge_functions]]
    path = "/.netlify/functions/github-proxy"
    function = "github-proxy-auth"

[[edge_functions]]
    path = "/.netlify/functions/github-proxy/*"
    function = "github-proxy-auth"
```

Then inject and configure the `TokenAuthBackend` in Decap CMS.

```typescript
import { TokenAuthBackend } from '@amazeelabs/decap-cms-backend-token-auth';
import CMS from 'decap-cms-app';

CMS.registerBackend('token-auth', TokenAuthBackend);

CMS.init({
  config: {
    backend: {
      name: 'token-auth',
      api_root: '/admin/_github',
      repo: 'myorg/myrepo',
      branch: 'main',
    },
  },
});
```
