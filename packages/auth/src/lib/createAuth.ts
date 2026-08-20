import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

import { createAuthConfig, getDatabaseUrl } from './createAuthConfig.js';
import * as schema from './schema.js';

export function createAuth(env: NodeJS.ProcessEnv = process.env) {
  const sql = neon(getDatabaseUrl(env));
  const db = drizzle(sql, { schema });

  return betterAuth({
    ...createAuthConfig(),
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
  });
}
