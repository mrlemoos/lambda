import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LambdaApi } from '@lambda/shell';
import { LambdaApiProvider } from '@lambda/shell';

import { ApplicationMenuBar } from './ApplicationMenuBar.js';
import { browserLambdaApi } from '../lib/browserLambdaApi.js';

describe('ApplicationMenuBar', () => {
  beforeEach(() => {
    vi.spyOn(browserLambdaApi, 'dispatchFileCommand');
  });

  it('renders File and Edit menus', () => {
    render(
      <MemoryRouter>
        <LambdaApiProvider api={browserLambdaApi as LambdaApi}>
          <ApplicationMenuBar />
        </LambdaApiProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('dispatches a new file command from the File menu', () => {
    render(
      <MemoryRouter>
        <LambdaApiProvider api={browserLambdaApi as LambdaApi}>
          <ApplicationMenuBar />
        </LambdaApiProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'File' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /New/i }));

    expect(browserLambdaApi.dispatchFileCommand).toHaveBeenCalledWith('new');
  });

  it('dispatches new on CmdOrCtrl+N', () => {
    render(
      <MemoryRouter>
        <LambdaApiProvider api={browserLambdaApi as LambdaApi}>
          <ApplicationMenuBar />
        </LambdaApiProvider>
      </MemoryRouter>,
    );

    fireEvent.keyDown(document, { key: 'n', metaKey: true });

    expect(browserLambdaApi.dispatchFileCommand).toHaveBeenCalledWith('new');
  });
});
