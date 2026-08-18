import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/auth', () => ({
  createAuth: () => ({}),
}));

vi.mock('better-auth/next-js', () => ({
  toNextJsHandler: () => ({
    GET: () => new Response('ok'),
    POST: () => new Response('ok'),
  }),
}));

describe('auth HTTP handlers', () => {
  it('exports GET and POST for better-auth', async () => {
    const result = await import('./route.js');

    expect(result.GET).toEqual(expect.any(Function));
    expect(result.POST).toEqual(expect.any(Function));
  });
});
