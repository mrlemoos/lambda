import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { EditorZoomProvider } from '@lambda/editor-zoom';
import type { LambdaApi } from '@lambda/lambda-api';
import { LambdaApiProvider } from '@lambda/lambda-api';
import { ScriptToolbar } from './ScriptToolbar.js';

function renderToolbar(props: {
  fileName: string;
  dirty: boolean;
  onBack?: () => Promise<'discard' | 'cancel'>;
  onTitlePage?: () => void;
  onPreview?: () => void;
}) {
  const onBack = props.onBack ?? vi.fn(async () => 'discard' as const);
  const api: LambdaApi = {
    platform: 'web',
    onFileCommand: () => () => undefined,
    onViewCommand: () => () => undefined,
    readFile: vi.fn(),
    writeFile: vi.fn(),
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    setWindowTitle: vi.fn(),
  };

  return render(
    <MemoryRouter initialEntries={['/script']}>
      <LambdaApiProvider api={api}>
        <EditorZoomProvider>
          <ScriptToolbar
            fileName={props.fileName}
            dirty={props.dirty}
            onBack={onBack}
            onTitlePage={props.onTitlePage}
            onPreview={props.onPreview}
          />
        </EditorZoomProvider>
      </LambdaApiProvider>
    </MemoryRouter>,
  );
}

describe('ScriptToolbar', () => {
  it('shows the filename and edited badge when dirty', () => {
    renderToolbar({ fileName: 'night-shift.fountain', dirty: true });

    expect(screen.getByText('night-shift.fountain')).not.toBeNull();
    expect(screen.getByText('Edited')).not.toBeNull();
  });

  it('shows the editor zoom readout', () => {
    renderToolbar({ fileName: 'night-shift.fountain', dirty: false });

    expect(screen.getByLabelText('Editor zoom')).toHaveTextContent('100%');
  });

  it('hides the edited badge when the script is saved', () => {
    renderToolbar({ fileName: 'night-shift.fountain', dirty: false });

    expect(screen.queryByText('Edited')).toBeNull();
  });

  it('calls onBack when the welcome link is clicked', async () => {
    const onBack = vi.fn(async () => 'cancel' as const);

    renderToolbar({
      fileName: 'night-shift.fountain',
      dirty: true,
      onBack,
    });

    fireEvent.click(screen.getByRole('link', { name: /welcome/i }));

    await waitFor(() => {
      expect(onBack).toHaveBeenCalledOnce();
    });
  });

  it('shows a title page button when onTitlePage is provided', () => {
    const onTitlePage = vi.fn();

    renderToolbar({
      fileName: 'night-shift.fountain',
      dirty: false,
      onTitlePage,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Title Page…' }));

    expect(onTitlePage).toHaveBeenCalledOnce();
  });

  it('shows a preview button when onPreview is provided', () => {
    const onPreview = vi.fn();

    renderToolbar({
      fileName: 'night-shift.fountain',
      dirty: false,
      onPreview,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Preview…' }));

    expect(onPreview).toHaveBeenCalledOnce();
  });
});
