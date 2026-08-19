import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LambdaApi } from '@lambda/lambda-api';
import { EditorZoomProvider } from '@lambda/editor-zoom';
import { LambdaApiProvider } from '@lambda/lambda-api';
import { ScriptSessionProvider } from '@lambda/script-session';

import { browserLambdaApi } from '../lib/browserLambdaApi.js';
import { ApplicationMenuBar } from './ApplicationMenuBar.js';

function renderMenuBar(pathname = '/') {
  return render(
    <LambdaApiProvider api={browserLambdaApi as LambdaApi}>
      <EditorZoomProvider pathname={pathname}>
        <ScriptSessionProvider>
          <ApplicationMenuBar />
        </ScriptSessionProvider>
      </EditorZoomProvider>
    </LambdaApiProvider>,
  );
}

describe('ApplicationMenuBar', () => {
  beforeEach(() => {
    vi.spyOn(browserLambdaApi, 'dispatchFileCommand');
  });

  it('renders File, Edit, and View menus', () => {
    renderMenuBar();

    expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
  });

  it('uses a transparent fill on the menu bar', () => {
    renderMenuBar();

    const result = screen.getByRole('navigation', { name: 'Application menu' });

    expect(result).toHaveClass('application-menu-bar', 'bg-transparent');
  });

  it('dispatches a new file command from the File menu', () => {
    renderMenuBar();

    fireEvent.click(screen.getByRole('button', { name: 'File' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /New/i }));

    expect(browserLambdaApi.dispatchFileCommand).toHaveBeenCalledWith('new');
  });

  it('dispatches new on CmdOrCtrl+N', () => {
    renderMenuBar();

    fireEvent.keyDown(document, { key: 'n', metaKey: true });

    expect(browserLambdaApi.dispatchFileCommand).toHaveBeenCalledWith('new');
  });

  it('disables view zoom commands on the welcome screen', () => {
    renderMenuBar('/');

    fireEvent.click(screen.getByRole('button', { name: 'View' }));

    expect(screen.getByRole('menuitem', { name: /Zoom In/i })).toBeDisabled();
  });
});
