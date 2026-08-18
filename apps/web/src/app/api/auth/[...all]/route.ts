import { toNextJsHandler } from 'better-auth/next-js';

import { createAuth } from '@lambda/auth';

function getHandlers() {
  return toNextJsHandler(createAuth());
}

export const GET = (request: Request) => getHandlers().GET(request);
export const POST = (request: Request) => getHandlers().POST(request);
