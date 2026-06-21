export type ScriptPaletteCommandId = 'title-page' | 'preview';

export type ScriptPaletteCommandDefinition = {
  id: ScriptPaletteCommandId;
  label: string;
  keywords?: string[];
};

export const SCRIPT_PALETTE_COMMANDS: ScriptPaletteCommandDefinition[] = [
  {
    id: 'title-page',
    label: 'Title Page…',
    keywords: ['title', 'metadata', 'author', 'credit'],
  },
  {
    id: 'preview',
    label: 'Preview…',
    keywords: ['preview', 'print', 'pdf', 'export'],
  },
];
