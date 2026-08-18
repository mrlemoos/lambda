export function readE2eFixture(fixtureName: string): string | null {
  const fixtures = parseE2eFixtures();
  const fixture = fixtures[fixtureName];

  return typeof fixture === 'string' ? fixture : null;
}

export function listE2eFixtureNames(): string[] {
  return Object.keys(parseE2eFixtures());
}

function parseE2eFixtures(): Record<string, string> {
  const raw = process.env.NEXT_PUBLIC_E2E_FIXTURES ?? '{}';

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}
