export type WritingAccess = 'write' | 'sign-in-wall' | 'offline-blocked';

export type WritingAccessInput = {
  hasSession: boolean;
  isOnline: boolean;
  hasEverSignedInOnThisClient: boolean;
};

export function resolveWritingAccess(input: WritingAccessInput): WritingAccess {
  if (input.hasSession) {
    return 'write';
  }

  if (input.isOnline) {
    return 'sign-in-wall';
  }

  if (input.hasEverSignedInOnThisClient) {
    return 'offline-blocked';
  }

  return 'write';
}
