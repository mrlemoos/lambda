export const UNPACKAGED_LAMBDA_WEB_ORIGIN = 'http://localhost:4300';

function toHttpOrigin(value: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error('LAMBDA_WEB_ORIGIN must be an http(s) origin');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('LAMBDA_WEB_ORIGIN must be an http(s) origin');
  }

  return parsed.origin;
}

export function resolveLambdaWebOrigin(input: {
  isPackaged: boolean;
  originFromEnv?: string;
}): string {
  const trimmed = input.originFromEnv?.trim();

  if (trimmed) {
    return toHttpOrigin(trimmed);
  }

  if (input.isPackaged) {
    throw new Error(
      'LAMBDA_WEB_ORIGIN is required when the desktop app is packaged',
    );
  }

  return UNPACKAGED_LAMBDA_WEB_ORIGIN;
}
