export function WindowDragRegion() {
  if (window.lambda.platform !== 'darwin') {
    return null;
  }

  return <div className="window-drag-region" aria-hidden="true" />;
}
