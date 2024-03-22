import { describe, expect, it, vi } from 'vitest';

import { EmailBackend } from './email-backend.js';

const delivery = vi.fn();

class MockedEmailBackend extends EmailBackend {
  async sendEmail(email: string, name: string, link: string): Promise<void> {
    delivery(email, name, link);
  }
}

describe('EmailBackend', () => {
  const backend = new MockedEmailBackend(
    {
      'bob@amazeelabs.dev': 'Bob',
      'alice@amazeelabs.dev': 'Alice',
      '*@amazeelabs.com': '*',
    },
    'noreply@amazeelabs.com',
  );

  it('returns undefined for an unknown email', async () => {
    expect(await backend.getInfo('frank@amazeelabs.dev')).toBeUndefined();
  });

  it('returns the name for a known email', async () => {
    expect(await backend.getInfo('bob@amazeelabs.dev')).toEqual({
      id: 'bob@amazeelabs.dev',
      name: 'Bob',
    });
  });

  it('returns the wildcard for a known domain', async () => {
    expect(await backend.getInfo('hillary@amazeelabs.com')).toEqual({
      id: 'hillary@amazeelabs.com',
      name: 'hillary',
    });
  });
  it('it catches fake addresses', async () => {
    expect(
      await backend.getInfo('"@amazeelabs.com@"@evil.com'),
    ).toBeUndefined();
  });
});
