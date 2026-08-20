import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export type EditorZoomSurfaceProps = {
  level: number;
  children: ReactNode;
};

export function EditorZoomSurface({ level, children }: EditorZoomSurfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousLevelRef = useRef(level);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const scale = level / 100;

  useLayoutEffect(() => {
    const node = contentRef.current;

    if (!node) {
      return;
    }

    const updateSize = () => {
      setContentSize({
        width: node.offsetWidth,
        height: node.offsetHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [children]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const previousLevel = previousLevelRef.current;

    if (!container || previousLevel === level) {
      previousLevelRef.current = level;
      return;
    }

    const oldScale = previousLevel / 100;
    const newScale = level / 100;
    const viewportCentreX = container.scrollLeft + container.clientWidth / 2;
    const viewportCentreY = container.scrollTop + container.clientHeight / 2;
    const contentCentreX = viewportCentreX / oldScale;
    const contentCentreY = viewportCentreY / oldScale;

    previousLevelRef.current = level;

    requestAnimationFrame(() => {
      container.scrollLeft =
        contentCentreX * newScale - container.clientWidth / 2;
      container.scrollTop =
        contentCentreY * newScale - container.clientHeight / 2;
    });
  }, [level, contentSize.height, contentSize.width]);

  return (
    <div className="editor-zoom-scroll" ref={scrollRef}>
      <div
        className="editor-zoom-spacer"
        style={{
          width: contentSize.width > 0 ? contentSize.width * scale : undefined,
          height:
            contentSize.height > 0 ? contentSize.height * scale : undefined,
          marginInline: 'auto',
        }}
      >
        <div
          className="editor-zoom-scale"
          data-testid="editor-zoom-scale"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: contentSize.width > 0 ? contentSize.width : undefined,
            height: contentSize.height > 0 ? contentSize.height : undefined,
          }}
        >
          <div ref={contentRef} className="editor-zoom-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
