export type GeneralPaletteCommandId = 'new' | 'open';

export type PaletteCommandDefinition = {
  id: GeneralPaletteCommandId;
  label: string;
  accelerator: string;
  keywords?: string[];
};

export const COMMAND_PALETTE_ACCELERATOR = 'CmdOrCtrl+K';

export const GENERAL_PALETTE_COMMANDS: PaletteCommandDefinition[] = [
  {
    id: 'new',
    label: 'New script',
    accelerator: 'CmdOrCtrl+N',
    keywords: ['new', 'create'],
  },
  {
    id: 'open',
    label: 'Open…',
    accelerator: 'CmdOrCtrl+O',
    keywords: ['open', 'file'],
  },
];
