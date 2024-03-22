import type { Info } from './handler.js';

/**
 * Client implementation to communicate with a token-auth backend.
 */
export class TokenAuthClient<TInfo extends Info> {
  /**
   * @param basePath
   */
  constructor(protected basePath: string) {}

  /**
   * Log in to the token-auth backend and optionally redirect to a destination.
   *
   * @param id The users unique identifier.
   * @param destination The destination url.
   */
  async login(id: string, destination?: string) {
    const url = `${this.basePath}/___login`;
    const dest = destination
      ? `?destination=${encodeURIComponent(destination)}`
      : '';
    const result = await fetch(`${url}${dest}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ id }).toString(),
    });
    if (!result.ok) {
      throw new Error(await result.text());
    }
  }

  /**
   * Retrieve the current authentication status.
   */
  async status() {
    const result = await fetch(`${this.basePath}/___status`);
    if (!result.ok) {
      throw new Error(await result.text());
    }
    return (await result.json()) as TInfo;
  }

  /**
   * Log out from the token-auth backend.
   */
  async logout() {
    const result = await fetch(`${this.basePath}/___logout`, {
      method: 'POST',
    });
    if (!result.ok) {
      throw new Error(await result.text());
    }
  }
}
