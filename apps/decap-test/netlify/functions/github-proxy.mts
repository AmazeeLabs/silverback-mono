import { githubProxy } from '@amazeelabs/decap-cms-backend-token-auth/proxy';

export default function (request: Request) {
  if (!process.env.DECAP_GITHUB_TOKEN) {
    throw new Error('Missing environment variable DECAP_GITHUB_TOKEN.');
  }
  return githubProxy(
    request,
    process.env.DECAP_GITHUB_TOKEN,
    '/.netlify/functions/github-proxy',
  );
}
