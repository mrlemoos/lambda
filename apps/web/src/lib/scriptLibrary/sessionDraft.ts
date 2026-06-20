const SESSION_DRAFT_KEY = 'lambda:session-draft';

export function saveSessionDraft(text: string): void {
  sessionStorage.setItem(SESSION_DRAFT_KEY, text);
}

export function loadSessionDraft(): string | null {
  return sessionStorage.getItem(SESSION_DRAFT_KEY);
}

export function clearSessionDraft(): void {
  sessionStorage.removeItem(SESSION_DRAFT_KEY);
}
