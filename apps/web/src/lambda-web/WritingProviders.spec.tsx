import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({
  pathname: '/',
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  usePathname: () => navigation.pathname,
}));

vi.mock('@lambda/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@lambda/auth')>();

  return {
    ...actual,
    createLambdaAuthClient: () => ({
      useSession: () => ({ data: null, isPending: false }),
    }),
  };
});

vi.mock('../lib/browserLambdaApi.js', () => ({
  browserLambdaApi: {
    platform: 'web',
    onFileCommand: vi.fn(() => () => undefined),
    onViewCommand: vi.fn(() => () => undefined),
    readFile: vi.fn(async () => ''),
    writeFile: vi.fn(async (filePath: string) => filePath),
    showOpenDialog: vi.fn(async () => null),
    showSaveDialog: vi.fn(async () => null),
    setWindowTitle: vi.fn(async () => undefined),
    dispatchFileCommand: vi.fn(),
    dispatchViewCommand: vi.fn(),
  },
}));

describe('WritingProviders', () => {
  beforeEach(() => {
    navigation.pathname = '/';
  });
  it('hides the application menu off the editor page', async () => {
    navigation.pathname = '/sign-in';
    const { WritingProviders } = await import('./WritingProviders.js');

    render(
      <WritingProviders>
        <h1>Sign in</h1>
      </WritingProviders>,
    );

    const result = screen.queryByRole('navigation', {
      name: 'Application menu',
    });

    expect(result).not.toBeInTheDocument();
  });

  it('renders the application menu on the editor page', async () => {
    navigation.pathname = '/script';
    const { WritingProviders } = await import('./WritingProviders.js');

    render(
      <WritingProviders>
        <h1>Lambda</h1>
      </WritingProviders>,
    );

    const result = screen.getByRole('button', { name: 'File' });

    expect(result).toBeInTheDocument();
  });
});
