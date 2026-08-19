import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

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
  it('renders application chrome around the page', async () => {
    const { WritingProviders } = await import('./WritingProviders.js');

    render(
      <WritingProviders>
        <h1>Lambda</h1>
      </WritingProviders>,
    );

    const result = screen.getByRole('heading', { name: 'Lambda' });

    expect(result).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument();
  });
});
