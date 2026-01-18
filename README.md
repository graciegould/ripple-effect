# Ripple Effect

A React component that creates an interactive water ripple effect on images using WebGL.

![Basic Demo](./src/demo/basic-demo.gif)

## Setup

```bash
npm install
npm run dev
```

## Usage

### Basic

```tsx
import { RippleEffect } from './RippleEffect';

<RippleEffect
  imageUrl="/images/bubbles.jpg"
  rippleSize={30}
  rippleStrength={1.0}
  distortionStrength={0.2}
/>
```

### Dynamic

![Controlled Demo](./src/demo/controlled-demo.gif)

```tsx
import { ControlledDemo } from './demo/ControlledDemo';

<ControlledDemo
  imageUrl="/images/bubbles..jpg"
  rippleSize={40}
  rippleStrength={1.5}
  distortionStrength={0.2}
  waveSpeed={1.0}
  springStrength={0.005}
  velocityDamping={0.002}
  pressureDamping={0.999}
  enableChromaticAberration={false}
  chromaticAberrationStrength={5.0}
/>
```


## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageUrl` | string | required | Background image URL |
| `rippleSize` | number | 30 | Size of each ripple in pixels |
| `rippleStrength` | number | 1.0 | Intensity of ripples |
| `distortionStrength` | number | 0.2 | How much the image distorts |
| `waveSpeed` | number | 1.0 | Animation speed multiplier |
| `springStrength` | number | 0.005 | Spring physics strength |
| `velocityDamping` | number | 0.002 | How quickly ripples slow down |
| `pressureDamping` | number | 0.999 | Overall ripple decay |
| `enableChromaticAberration` | boolean | false | Enable chromatic aberration effect |
| `chromaticAberrationStrength` | number | 1.0 | Chromatic aberration intensity |
