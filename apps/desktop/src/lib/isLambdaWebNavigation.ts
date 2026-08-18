export function isLambdaWebNavigation(
  target: string,
  allowedOrigin: string,
): boolean {
  try {
    return new URL(target).origin === allowedOrigin;
  } catch {
    return false;
  }
}
