import { CSSProperties } from 'react';

/**
 * Props for the RippleEffect component
 */
export interface RippleEffectProps {
  /** Background image URL (required) */
  imageUrl: string;

  /** Optional className for the container */
  className?: string;

  /** Optional inline styles */
  style?: CSSProperties;

  /** Size of each ripple in pixels */
  rippleSize?: number;

  /** Strength/intensity of ripples */
  rippleStrength?: number;

  /** How much the image distorts */
  distortionStrength?: number;

  /** Animation speed multiplier */
  waveSpeed?: number;

  /** Spring physics strength */
  springStrength?: number;

  /** Velocity damping - how quickly ripples slow down */
  velocityDamping?: number;

  /** Pressure damping - overall ripple decay */
  pressureDamping?: number;

  /** Enable chromatic aberration effect */
  enableChromaticAberration?: boolean;

  /** Chromatic aberration strength */
  chromaticAberrationStrength?: number;

  /** Chromatic aberration dispersal */
  chromaticAberrationDispersal?: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  rippleSize: 30,
  rippleStrength: 1.0,
  distortionStrength: 0.2,
  waveSpeed: 1.0,
  springStrength: 0.005,
  velocityDamping: 0.002,
  pressureDamping: 0.999,
  enableChromaticAberration: false,
  chromaticAberrationStrength: 1.0,
  chromaticAberrationDispersal: 0.01,
} as const;

/**
 * Internal mouse/touch state tracking
 */
export interface MouseState {
  x: number;
  y: number;
  down: boolean;
  lastX: number;
  lastY: number;
}

/**
 * WebGL refs for internal state management
 */
export interface WebGLRefs {
  gl: WebGLRenderingContext | null;
  waterProgram: WebGLProgram | null;
  imageProgram: WebGLProgram | null;
  framebufferA: WebGLFramebuffer | null;
  framebufferB: WebGLFramebuffer | null;
  textureA: WebGLTexture | null;
  textureB: WebGLTexture | null;
  imageTexture: WebGLTexture | null;
}

/**
 * Image dimensions for aspect ratio calculations
 */
export interface ImageDimensions {
  width: number;
  height: number;
}
