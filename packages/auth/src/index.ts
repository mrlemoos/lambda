export {
  ACCOUNT_SESSION_MAX_AGE_SECONDS,
  ACCOUNT_SESSION_UPDATE_AGE_SECONDS,
  createAuthConfig,
  getDatabaseUrl,
} from './lib/createAuthConfig.js';
export { createAuth } from './lib/createAuth.js';
export { createLambdaAuthClient } from './lib/createLambdaAuthClient.js';
export {
  getHasEverSignedInStorage,
  HAS_EVER_SIGNED_IN_STORAGE_KEY,
  syncHasEverSignedInOnThisClient,
} from './lib/hasEverSignedInOnThisClient.js';
export {
  resolveWritingAccess,
  type WritingAccess,
  type WritingAccessInput,
} from './lib/resolveWritingAccess.js';
export * as schema from './lib/schema.js';
