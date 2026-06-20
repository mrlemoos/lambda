export {
  ScriptEditor,
  type PageFormat,
  type ScriptEditorProps,
} from './lib/ScriptEditor';
export {
  ScriptEditorSurface,
  type ScriptEditorSurfaceProps,
} from './lib/tiptap/ScriptEditorSurface';
export {
  ScriptEditorCommandsProvider,
  useScriptEditorCommands,
  type ScriptEditorCommands,
} from './lib/tiptap/scriptEditorCommands';
export {
  createScriptEditor,
  getEditorRuntimeMarker,
  useScriptEditor,
} from './lib/tiptap/useScriptEditor';
export {
  TitlePageView,
  type TitlePageViewProps,
} from './lib/elements/TitlePageView';
export {
  parseTitlePage,
  extractTitlePageLines,
  type TitlePageData,
} from './lib/elements/parseTitlePage';
export { classifyLine, type ClassifiedElement } from './lib/ClassifyLine';
export {
  classifyBlock,
  previousBlockContext,
  type ClassifyBlockContext,
} from './lib/tiptap/classifyBlock';
