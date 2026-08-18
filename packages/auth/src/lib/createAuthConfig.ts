export const ACCOUNT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const ACCOUNT_SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

export type AuthConfig = {
  emailAndPassword: { enabled: true };
  session: {
    expiresIn: number;
    updateAge: number;
  };
};

export function createAuthConfig(): AuthConfig {
  return {
    emailAndPassword: { enabled: true },
    session: {
      expiresIn: ACCOUNT_SESSION_MAX_AGE_SECONDS,
      updateAge: ACCOUNT_SESSION_UPDATE_AGE_SECONDS,
    },
  };
}

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const url = env.DATABASE_URL ?? env.POSTGRES_URL;

  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Connect the Vercel Marketplace Neon resource `lambda` without committing secrets.',
    );
  }

  return url;
}
