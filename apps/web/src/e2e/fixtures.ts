import { e2eFixtures } from 'virtual:lambda-e2e-fixtures';

export function readE2eFixture(fixtureName: string): string | null {
  const fixture = e2eFixtures[fixtureName];

  return typeof fixture === 'string' ? fixture : null;
}

export function listE2eFixtureNames(): string[] {
  return Object.keys(e2eFixtures);
}
