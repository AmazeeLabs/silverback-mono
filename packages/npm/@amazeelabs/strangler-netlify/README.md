# Strangler (Netlify)

Library that allows to create a Netlify function that implements the [strangler
fig] pattern. It allows to layer a Netlify website on top of on or more legacy
systems, gradually replacing them.

## Concept

Every path that is not part of the Netlify website, is handed to a list of
legacy systems. If a system is able to handle that path, the response will be
proxied back to the client. If not, the next system will be tried. If none of
the systems can handle the path, a 404 will be returned.

## Usage

Add the library to your project:

```bash
pnpm add @amazeelabs/strangler-netlify
```

Create a Netlify function that uses the library:

```typescript
// file: netlify/functions/strangler.ts
import { createStrangler } from '@amazeelabs/strangler-netlify';
import fs from 'fs';

// Read the static 404 page from the file system.
// Thats the page content the function will return if none
// of the legacy systems can handle the request.
const notFoundPage = fs.readFileSync('./public/404.html');

export const handler = createStrangler(
  [
    {
      // Specify a URL to the legacy system.
      url: 'https://legacy.web.site',
      // Optional function that can check if the current url even
      // applies for the system. If not, the system will be skipped.
      applies: (url) => url.pathname.startsWith('/redirect/'),
      // Optional function that can modify the response from the legacy system.
      // If the function returns undefined, the response will be ignored and the
      // next system will be tried.
      process: (response) =>
        [301, 302].includes(response.status) ? response : undefined,
    },
  ],
  notFoundPage,
);
```

Add a catchall-redirect to the `_redirects`, that will pass the request to the
strangler function:

```
# Pass all unhandled requests to the strangler function.
/* /.netlify/functions/strangler 200
```

> **Warning:**  
> The redirect must be the last line in the file.

## Optimizations

The redirect will not be executed for any files that are part of the Netlify
build and for paths that match redirects or rewrites in the `_redirects` file.
To reduce the number of invocation of the function, it is recommended to add
manual rewrites for any known paths that should be handled by the legacy
systems.

```
# Rewrite uploaded Drupal files to Drupal directly.
/sites/default/files/* https://legacy.web.site/sites/default/files/:splat 200

# Pass all unhandled requests to the strangler function.
/* /.netlify/functions/strangler 200
```

[strangler fig]:
  https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig
