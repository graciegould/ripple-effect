import React from 'react';
import { RippleCanvas } from './core/RippleCanvas';
import { RippleEffectProps } from './types';

/**
 * RippleEffect - Interactive water ripple effect component
 *
 * Creates an interactive water ripple effect on an image using WebGL.
 * Move your mouse or drag across the surface to create ripples.
 *
 * @example
 * ```tsx
 * <RippleEffect
 *   imageUrl="/images/water.jpg"
 *   rippleSize={30}
 *   rippleStrength={1.0}
 *   distortionStrength={0.2}
 * />
 * ```
 */
export const RippleEffect: React.FC<RippleEffectProps> = (props) => {
  return <RippleCanvas {...props} />;
};

export default RippleEffect;
