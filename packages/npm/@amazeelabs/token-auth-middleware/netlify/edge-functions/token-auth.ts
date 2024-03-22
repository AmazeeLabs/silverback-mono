import type { Context } from '@netlify/edge-functions';

// For some reason pnpm package imports break in edge handlers.
import {
  JwtEncoder,
  TestEmailBackend,
  TokenAuthHandler,
} from '../../build/index.js';

const encoder = new JwtEncoder('shhhh');
const backend = new TestEmailBackend(
  {
    '*@amazeelabs.com': '*',
  },
  'noreply@amazeelabs.com',
);

const handler = new TokenAuthHandler('/restricted', encoder, backend);

export default async (request: Request, context: Context) => {
  // For integration tests to retrieve the login link.
  if (request.url.endsWith('/___link')) {
    return new Response(backend.getLatestLink());
  }
  return handler.handle(request, context.next);
};
