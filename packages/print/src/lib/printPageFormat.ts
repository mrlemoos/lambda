import type { PageFormat } from '@lambda/editor';

export function getPrintPageCss(pageFormat: PageFormat): string {
  const size = pageFormat === 'a4' ? 'A4' : 'letter';

  return `@page { size: ${size}; margin: 0; }`;
}

export function getElectronPrintPageSize(
  pageFormat: PageFormat,
): 'A4' | 'Letter' {
  return pageFormat === 'a4' ? 'A4' : 'Letter';
}

export function applyPrintPageFormat(pageFormat: PageFormat): () => void {
  const style = document.createElement('style');
  style.setAttribute('data-print-page-format', pageFormat);
  style.media = 'print';
  style.textContent = getPrintPageCss(pageFormat);
  document.head.appendChild(style);

  return () => {
    style.remove();
  };
}

export function printPreview(pageFormat: PageFormat): void {
  const cleanup = applyPrintPageFormat(pageFormat);

  const removeAfterPrint = () => {
    cleanup();
    window.removeEventListener('afterprint', removeAfterPrint);
  };

  window.addEventListener('afterprint', removeAfterPrint);
  window.print();
}
