import { HashRouter } from 'react-router-dom';
import {
  EditorZoomProvider,
  LambdaApiProvider,
  ScriptSessionProvider,
  ShellRoutes,
  useScriptSession,
  WindowDragRegion,
} from '@lambda/shell';

function ScriptWindowDragRegion() {
  const { fileName, script } = useScriptSession();

  return <WindowDragRegion fileName={script ? fileName : null} />;
}

export function App() {
  return (
    <HashRouter>
      <LambdaApiProvider api={window.lambda}>
        <EditorZoomProvider>
          <ScriptSessionProvider>
            <ScriptWindowDragRegion />
            <ShellRoutes />
          </ScriptSessionProvider>
        </EditorZoomProvider>
      </LambdaApiProvider>
    </HashRouter>
  );
}

export default App;
