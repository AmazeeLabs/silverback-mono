# Decap Token-Auth backend

Decap backend that uses token authentication instead of Netlify Identity or
similar services. This package is meant to be used in combination with the
`@amazeelabs/token-auth-middleware` package. It contains a proxy service that
can run as a serverless function and handle Decap requests with a dedicated
Github token.

## Usage

For example, create a netlify edge function and simply pass the request to a
proxy.

```typescript
import type { Context } from '@netlify/functions';
import { githubProxy } from '@amazeelabs/decap-cms-backend-token-auth/proxy';

export default function (request: Request, context: Context) {
  if (!process.env.DECAP_GITHUB_TOKEN) {
    throw new Error('No Github token configured');
  }
  return githubProxy(request, process.env.DECAP_GITHUB_TOKEN, '/admin/_github');
}
```

> [!IMPORTANT]  
> Make sure to configure `@amazeelabs/token-auth-middleware` to use the same
> `/admin/_github` path and protect it properly.

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
