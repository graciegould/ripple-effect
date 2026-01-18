import React, { useRef, useCallback, useEffect } from 'react';
import { useWebGL } from '../hooks/useWebGL';
import useResizeWebGLCanvas from '../../hooks/useResizeWebGLCanvas';
import { RippleEffectProps, DEFAULT_CONFIG } from '../types';
import styles from '../RippleEffect.module.scss';

type RippleCanvasProps = Required<Pick<RippleEffectProps, 'imageUrl'>> &
  Omit<RippleEffectProps, 'imageUrl'>;

export const RippleCanvas: React.FC<RippleCanvasProps> = ({
  imageUrl,
  className = '',
  style,
  rippleSize = DEFAULT_CONFIG.rippleSize,
  rippleStrength = DEFAULT_CONFIG.rippleStrength,
  distortionStrength = DEFAULT_CONFIG.distortionStrength,
  waveSpeed = DEFAULT_CONFIG.waveSpeed,
  springStrength = DEFAULT_CONFIG.springStrength,
  velocityDamping = DEFAULT_CONFIG.velocityDamping,
  pressureDamping = DEFAULT_CONFIG.pressureDamping,
  enableChromaticAberration = DEFAULT_CONFIG.enableChromaticAberration,
  chromaticAberrationStrength = DEFAULT_CONFIG.chromaticAberrationStrength,
  chromaticAberrationDispersal = DEFAULT_CONFIG.chromaticAberrationDispersal,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitializedRef = useRef(false);

  const { initWebGL, render, handleResize, cleanup, mouseRef, webglRefs } = useWebGL({
    waveSpeed,
    springStrength,
    velocityDamping,
    pressureDamping,
    rippleSize,
    rippleStrength,
    distortionStrength,
    enableChromaticAberration,
    chromaticAberrationStrength,
    chromaticAberrationDispersal,
  });

  const initAndRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initWebGL(canvas, imageUrl);
    render();
  }, [initWebGL, render, imageUrl]);

  const handleCanvasResize = useCallback(
    (width: number, height: number) => {
      if (!webglRefs.current.gl) {
        initAndRender();
        isInitializedRef.current = true;
        return;
      }
      handleResize(width, height);
    },
    [webglRefs, initAndRender, handleResize]
  );

  useResizeWebGLCanvas(parentRef, canvasRef, handleCanvasResize);

  // Mouse event handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = canvas.height - (e.clientY - rect.top);

    mouseRef.current.x = x;
    mouseRef.current.y = y;

    const hasMoved =
      Math.abs(x - mouseRef.current.lastX) > 1 ||
      Math.abs(y - mouseRef.current.lastY) > 1;

    if (hasMoved) {
      mouseRef.current.down = true;
      mouseRef.current.lastX = x;
      mouseRef.current.lastY = y;
    }
  }, [mouseRef]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.down = false;
  }, [mouseRef]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = canvas.height - (touch.clientY - rect.top);

    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.lastX = x;
    mouseRef.current.lastY = y;
    mouseRef.current.down = true;

    e.preventDefault();
  }, [mouseRef]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = canvas.height - (touch.clientY - rect.top);

    mouseRef.current.x = x;
    mouseRef.current.y = y;

    const hasMoved =
      Math.abs(x - mouseRef.current.lastX) > 1 ||
      Math.abs(y - mouseRef.current.lastY) > 1;

    if (hasMoved) {
      mouseRef.current.down = true;
      mouseRef.current.lastX = x;
      mouseRef.current.lastY = y;
    }

    e.preventDefault();
  }, [mouseRef]);

  const handleTouchEnd = useCallback(() => {
    mouseRef.current.down = false;
  }, [mouseRef]);

  // Document-level mouse events for drag across page
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = canvas.height - (e.clientY - rect.top);

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        mouseRef.current.x = x;
        mouseRef.current.y = y;

        const hasMoved =
          Math.abs(x - mouseRef.current.lastX) > 1 ||
          Math.abs(y - mouseRef.current.lastY) > 1;

        if (hasMoved) {
          mouseRef.current.down = true;
          mouseRef.current.lastX = x;
          mouseRef.current.lastY = y;
        }
      }
    };

    const handleDocumentMouseUp = () => {
      mouseRef.current.down = false;
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [mouseRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div ref={parentRef} className={`${styles.container} ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default RippleCanvas;
