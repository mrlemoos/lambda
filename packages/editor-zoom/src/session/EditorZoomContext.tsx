import {
  adjustEditorZoom,
  formatZoomReadout,
  type EditorZoomAction,
} from '../lib/editorZoom.js';
import {
  getEditorZoomStorage,
  readStoredEditorZoom,
  writeStoredEditorZoom,
} from '../lib/editorZoomStorage.js';
import {
  matchesActualSizeShortcut,
  matchesZoomInShortcut,
  matchesZoomOutShortcut,
} from '@lambda/application-menu';
import type { ViewCommand } from '@lambda/lambda-api';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

import { useLambdaApi } from '@lambda/lambda-api';

type EditorZoomContextValue = {
  level: number;
  readout: string;
  canAdjust: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  actualSize: () => void;
  applyAction: (action: EditorZoomAction) => void;
};

const EditorZoomContext = createContext<EditorZoomContextValue | null>(null);

export type EditorZoomProviderProps = {
  children: ReactNode;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
};

export function EditorZoomProvider({
  children,
  storage = getEditorZoomStorage(),
}: EditorZoomProviderProps) {
  const api = useLambdaApi();
  const location = useLocation();
  const [level, setLevel] = useState(() => readStoredEditorZoom(storage));
  const canAdjust = location.pathname === '/script';

  const applyAction = useCallback(
    (action: EditorZoomAction) => {
      setLevel((current) => {
        const nextLevel = adjustEditorZoom(current, action);
        writeStoredEditorZoom(storage, nextLevel);
        return nextLevel;
      });
    },
    [storage],
  );

  const zoomIn = useCallback(() => applyAction('in'), [applyAction]);
  const zoomOut = useCallback(() => applyAction('out'), [applyAction]);
  const actualSize = useCallback(
    () => applyAction('actual-size'),
    [applyAction],
  );

  const handleViewCommand = useCallback(
    (command: ViewCommand) => {
      if (!canAdjust) {
        return;
      }

      applyAction(command);
    },
    [applyAction, canAdjust],
  );

  useEffect(() => {
    return api.onViewCommand((command) => {
      handleViewCommand(command);
    });
  }, [api, handleViewCommand]);

  useEffect(() => {
    if (!canAdjust) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (matchesZoomInShortcut(event)) {
        event.preventDefault();
        zoomIn();
        return;
      }

      if (matchesZoomOutShortcut(event)) {
        event.preventDefault();
        zoomOut();
        return;
      }

      if (matchesActualSizeShortcut(event)) {
        event.preventDefault();
        actualSize();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [actualSize, canAdjust, zoomIn, zoomOut]);

  const value = useMemo(
    () => ({
      level,
      readout: formatZoomReadout(level),
      canAdjust,
      zoomIn,
      zoomOut,
      actualSize,
      applyAction,
    }),
    [actualSize, applyAction, canAdjust, level, zoomIn, zoomOut],
  );

  return (
    <EditorZoomContext.Provider value={value}>
      {children}
    </EditorZoomContext.Provider>
  );
}

export function useEditorZoom(): EditorZoomContextValue {
  const context = useContext(EditorZoomContext);

  if (!context) {
    throw new Error('useEditorZoom must be used within EditorZoomProvider');
  }

  return context;
}
