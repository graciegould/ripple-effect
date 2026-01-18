import React, { useEffect, useRef, useState } from 'react';
import { RippleEffect } from '../RippleEffect';
import styles from './BasicDemo.module.scss';

export const AutoAnimatedDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rippleEvents, setRippleEvents] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.02;

      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Create circular motion with varying radius
      const radius = Math.min(rect.width, rect.height) * 0.25;
      const x = centerX + Math.cos(time) * radius + Math.sin(time * 0.7) * radius * 0.3;
      const y = centerY + Math.sin(time * 1.3) * radius + Math.cos(time * 0.5) * radius * 0.3;

      setRippleEvents({ x, y });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    if (!rippleEvents || !containerRef.current) return;

    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) return;

    // Dispatch a synthetic mouse event to trigger ripples
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: containerRef.current.getBoundingClientRect().left + rippleEvents.x,
      clientY: containerRef.current.getBoundingClientRect().top + rippleEvents.y,
      bubbles: true,
    });

    // Simulate mouse down state
    const downEvent = new MouseEvent('mousedown', {
      clientX: containerRef.current.getBoundingClientRect().left + rippleEvents.x,
      clientY: containerRef.current.getBoundingClientRect().top + rippleEvents.y,
      bubbles: true,
    });

    canvas.dispatchEvent(downEvent);
    canvas.dispatchEvent(mouseEvent);
  }, [rippleEvents]);

  return (
    <div ref={containerRef} className={styles.container}>
      <RippleEffect
        imageUrl="/images/tiedye.jpg"
        rippleSize={40}
        rippleStrength={0.8}
        distortionStrength={0.3}
        waveSpeed={0.8}
        springStrength={0.004}
        velocityDamping={0.001}
        pressureDamping={0.998}
        enableChromaticAberration={true}
        chromaticAberrationStrength={1.2}
      />
    </div>
  );
};

export default AutoAnimatedDemo;
