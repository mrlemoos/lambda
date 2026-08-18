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

import { GET, POST } from './route.js';

describe('auth HTTP handlers', () => {
  it('exports GET and POST for better-auth', () => {
    const result = { GET, POST };

    expect(result.GET).toEqual(expect.any(Function));
    expect(result.POST).toEqual(expect.any(Function));
  });
});
