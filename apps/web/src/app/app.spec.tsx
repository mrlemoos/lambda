import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from './App.js';

vi.mock('../lib/browserLambdaApi.js', () => ({
  browserLambdaApi: {
    platform: 'web',
    onFileCommand: vi.fn(() => () => undefined),
    readFile: vi.fn(async () => ''),
    writeFile: vi.fn(async (filePath: string) => filePath),
    showOpenDialog: vi.fn(async () => null),
    showSaveDialog: vi.fn(async () => null),
    setWindowTitle: vi.fn(async () => undefined),
    dispatchFileCommand: vi.fn(),
  },
}));

describe('App', () => {
  it('renders the welcome screen', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Lambda' })).toBeInTheDocument();
  });
});
