import { useEffect, useRef } from 'react';

interface ResizeCallback {
  (width: number, height: number): void;
}

const useResizeWebGLCanvas = (
  parentRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onResize: ResizeCallback
) => {
  const resizeFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = parentRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      if (resizeFrameRef.current) {
        cancelAnimationFrame(resizeFrameRef.current);
      }

      resizeFrameRef.current = requestAnimationFrame(() => {
        if (!canvas || !container) return;

        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        // Only resize if dimensions changed
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          onResize(newWidth, newHeight);
        }

        resizeFrameRef.current = null;
      });
    };

    // Initial size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    onResize(container.clientWidth, container.clientHeight);

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (resizeFrameRef.current) {
        cancelAnimationFrame(resizeFrameRef.current);
      }
    };
  }, [parentRef, canvasRef, onResize]);
};

export default useResizeWebGLCanvas;
