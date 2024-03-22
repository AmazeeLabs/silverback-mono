import { describe, expect, it, vi } from 'vitest';

import { JwtEncoder } from './jwt-encoder.js';

describe('JwtEncoder', () => {
  const data = 'test@amazeelabs.dev';
  const encoder = new JwtEncoder('sshhhhh');

  // The point in time when the token is created.
  const timeCreated = new Date(`2024-01-01 00:00:00`);
  // The point in time when the token is validated.
  const timeValidated = new Date(`2024-01-01 00:00:30`);

  it('should create a parseable token', async () => {
    vi.setSystemTime(timeCreated);
    const token = await encoder.create(data, 60);
    vi.setSystemTime(timeValidated);
    const payload = await encoder.validate(token);
    expect(payload).toEqual(data);
  });

  it('should detect a valid token', async () => {
    vi.setSystemTime(timeCreated);
    const token = await encoder.create(data, 60);
    vi.setSystemTime(timeValidated);
    expect(async () => await encoder.validate(token)).not.toThrow();
  });

  it('should detect an expired token', async () => {
    vi.setSystemTime(timeCreated);
    const token = await encoder.create(data, 15);
    vi.setSystemTime(timeValidated);
    expect(async () => await encoder.validate(token)).rejects.toThrow(
      'Token expired',
    );
  });

  it('should detect a tampered token', async () => {
    vi.setSystemTime(timeCreated);
    const token = await encoder.create('test@amazeelabs.dev', 60);
    const [header, , signature] = token.split('.');
    const tamperedBody = btoa(JSON.stringify({ email: 'hacker@evil.com' }));
    const tamperedToken = [header, tamperedBody, signature].join('.');
    vi.setSystemTime(timeValidated);
    expect(async () => await encoder.validate(tamperedToken)).rejects.toThrow(
      'Token invalid',
    );
  });

  it('should allow an infinite token', async () => {
    vi.setSystemTime(timeCreated);
    const token = await encoder.create('test@amazeelabs.dev');
    vi.setSystemTime(timeValidated);
    expect(async () => await encoder.validate(token)).not.toThrow();
  });
});
