export function WindowDragRegion({ fileName }: { fileName?: string | null }) {
  if (window.lambda.platform !== 'darwin') {
    return null;
  }

  return (
    <div
      className="window-drag-region"
      aria-hidden={fileName ? undefined : true}
    >
      {fileName ? (
        <span className="window-drag-region-filename">{fileName}</span>
      ) : null}
    </div>
  );
}
