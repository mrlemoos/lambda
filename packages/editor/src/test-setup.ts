import '@testing-library/jest-dom/vitest';

if (typeof document.elementFromPoint !== 'function') {
  document.elementFromPoint = () => null;
}

const emptyDomRectList = {
  length: 0,
  item: () => null,
  [Symbol.iterator]: [][Symbol.iterator].bind([]),
} as DOMRectList;

if (typeof Range.prototype.getClientRects !== 'function') {
  Range.prototype.getClientRects = () => emptyDomRectList;
}

if (typeof Range.prototype.getBoundingClientRect !== 'function') {
  Range.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}

if (typeof Element.prototype.getClientRects !== 'function') {
  Element.prototype.getClientRects = function getClientRects() {
    const rect = this.getBoundingClientRect();

    return {
      length: 1,
      item: () => rect,
      [Symbol.iterator]: function* clientRectIterator() {
        yield rect;
      },
    } as DOMRectList;
  };
}

if (typeof Element.prototype.getBoundingClientRect !== 'function') {
  Element.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}
