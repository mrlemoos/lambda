import type { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

export function getMacBrowserWindowOptions(): BrowserWindowConstructorOptions {
  return {
    transparent: true,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    titleBarOverlay: {
      color: '#00000000',
      height: 40,
    },
  };
}

export function configureMacWindowChrome(window: BrowserWindow): void {
  window.setWindowButtonVisibility(true);
}
