import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applyPrintPageFormat,
  getElectronPrintPageSize,
  getPrintPageCss,
  printPreview,
} from './printPageFormat';

describe('getPrintPageCss', () => {
  it('uses letter size for US Letter', () => {
    const result = getPrintPageCss('us-letter');

    expect(result).toContain('size: letter');
  });

  it('uses A4 size for A4', () => {
    const result = getPrintPageCss('a4');

    expect(result).toContain('size: A4');
  });
});

describe('getElectronPrintPageSize', () => {
  it('maps US Letter to Electron Letter', () => {
    const result = getElectronPrintPageSize('us-letter');

    expect(result).toBe('Letter');
  });

  it('maps A4 to Electron A4', () => {
    const result = getElectronPrintPageSize('a4');

    expect(result).toBe('A4');
  });
});

describe('applyPrintPageFormat', () => {
  afterEach(() => {
    document.head
      .querySelectorAll('style[data-print-page-format]')
      .forEach((node) => {
        node.remove();
      });
  });

  it('injects a print stylesheet for the requested format', () => {
    const cleanup = applyPrintPageFormat('a4');

    const style = document.querySelector('style[data-print-page-format="a4"]');

    expect(style?.textContent).toContain('size: A4');

    cleanup();

    expect(
      document.querySelector('style[data-print-page-format="a4"]'),
    ).toBeNull();
  });
});

describe('printPreview', () => {
  afterEach(() => {
    document.head
      .querySelectorAll('style[data-print-page-format]')
      .forEach((node) => {
        node.remove();
      });
    vi.restoreAllMocks();
  });

  it('opens the browser print dialog and cleans up page styles afterwards', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {
      window.dispatchEvent(new Event('afterprint'));
    });

    printPreview('us-letter');

    expect(print).toHaveBeenCalled();
    expect(
      document.querySelector('style[data-print-page-format="us-letter"]'),
    ).toBeNull();
  });
});
