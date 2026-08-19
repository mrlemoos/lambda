import { resolveWritingAccess, type WritingAccess } from '@lambda/auth';

export function composeWritingAccess(input: {
  hasSession: boolean;
  isOnline: boolean;
  hasEverSignedInOnThisClient: boolean;
  isE2e: boolean;
}): WritingAccess {
  if (input.isE2e) {
    return 'write';
  }

  return resolveWritingAccess(input);
}
