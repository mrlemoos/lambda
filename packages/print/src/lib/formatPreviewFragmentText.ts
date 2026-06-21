import { fountainPrintText } from '@lambda/editor';

/** Pagination treats empty body blocks as one typed blank line; preserve that in DOM. */
export function formatPreviewFragmentText(text: string): string {
  if (text.length === 0) {
    return '\u00a0';
  }

  return fountainPrintText(text);
}

export function isBlankPreviewFragment(text: string): boolean {
  return text.length === 0;
}
