export function isLambdaWebE2e(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.NEXT_PUBLIC_E2E === '1' || env.VITE_E2E === '1';
}
