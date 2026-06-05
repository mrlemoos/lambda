import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const editorDist = resolve(root, 'packages/editor/dist/index.js');
const editorSource = resolve(
  root,
  'packages/editor/src/lib/tiptap/classifyCurrentBlock.ts',
);

const markers = [
  'classifyCurrentBlock',
  'normalizeScriptBlocks',
  'lambda-editor-classify-v3',
  'classifyBlock',
];

const dist = await readFile(editorDist, 'utf8');
const missing = markers.filter((marker) => !dist.includes(marker));

if (missing.length > 0) {
  console.error(
    `@lambda/editor dist is missing expected classification code: ${missing.join(', ')}`,
  );
  console.error(
    `Rebuild with: pnpm nx run @lambda/editor:build --skip-nx-cache`,
  );
  process.exit(1);
}

const source = await readFile(editorSource, 'utf8');
if (!source.includes('normalizeScriptDocumentTransaction')) {
  console.error(
    'Editor source looks out of date; expected normalizeScriptDocumentTransaction.',
  );
  process.exit(1);
}

console.log(
  'OK: @lambda/editor dist includes screenplay classification extensions.',
);
console.log(`  dist: ${editorDist}`);
