import React, { useState } from 'react';
import { RippleEffect, RippleEffectProps, DEFAULT_CONFIG } from '../RippleEffect';
import styles from './ControlledDemo.module.scss';

export interface ControlledDemoProps extends Omit<RippleEffectProps, 'className' | 'style'> {}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange }) => (
  <div className={styles.sliderGroup}>
    <label className={styles.label}>
      {label}: <span className={styles.value}>{value}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={styles.slider}
    />
  </div>
);

export const ControlledDemo: React.FC<ControlledDemoProps> = (props) => {
  const [rippleSize, setRippleSize] = useState<number>(props.rippleSize ?? DEFAULT_CONFIG.rippleSize);
  const [rippleStrength, setRippleStrength] = useState<number>(props.rippleStrength ?? DEFAULT_CONFIG.rippleStrength);
  const [distortionStrength, setDistortionStrength] = useState<number>(props.distortionStrength ?? DEFAULT_CONFIG.distortionStrength);
  const [waveSpeed, setWaveSpeed] = useState<number>(props.waveSpeed ?? DEFAULT_CONFIG.waveSpeed);
  const [springStrength, setSpringStrength] = useState<number>(props.springStrength ?? DEFAULT_CONFIG.springStrength);
  const [velocityDamping, setVelocityDamping] = useState<number>(props.velocityDamping ?? DEFAULT_CONFIG.velocityDamping);
  const [pressureDamping, setPressureDamping] = useState<number>(props.pressureDamping ?? DEFAULT_CONFIG.pressureDamping);
  const [enableChromaticAberration, setEnableChromaticAberration] = useState<boolean>(
    props.enableChromaticAberration ?? DEFAULT_CONFIG.enableChromaticAberration
  );
  const [chromaticAberrationStrength, setChromaticAberrationStrength] = useState<number>(
    props.chromaticAberrationStrength ?? DEFAULT_CONFIG.chromaticAberrationStrength
  );

  const resetToDefaults = () => {
    setRippleSize(DEFAULT_CONFIG.rippleSize);
    setRippleStrength(DEFAULT_CONFIG.rippleStrength);
    setDistortionStrength(DEFAULT_CONFIG.distortionStrength);
    setWaveSpeed(DEFAULT_CONFIG.waveSpeed);
    setSpringStrength(DEFAULT_CONFIG.springStrength);
    setVelocityDamping(DEFAULT_CONFIG.velocityDamping);
    setPressureDamping(DEFAULT_CONFIG.pressureDamping);
    setEnableChromaticAberration(DEFAULT_CONFIG.enableChromaticAberration);
    setChromaticAberrationStrength(DEFAULT_CONFIG.chromaticAberrationStrength);
  };

  return (
    <div className={styles.container}>
      <div className={styles.rippleContainer}>
        <RippleEffect
          imageUrl="/images/water.jpg"
          rippleSize={rippleSize}
          rippleStrength={rippleStrength}
          distortionStrength={distortionStrength}
          waveSpeed={waveSpeed}
          springStrength={springStrength}
          velocityDamping={velocityDamping}
          pressureDamping={pressureDamping}
          enableChromaticAberration={enableChromaticAberration}
          chromaticAberrationStrength={chromaticAberrationStrength}
        />
      </div>

      <div className={styles.panel}>
        <h2 className={styles.title}>Ripple Settings</h2>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic</h3>
          <Slider
            label="Ripple Size"
            value={rippleSize}
            min={5}
            max={100}
            step={1}
            onChange={setRippleSize}
          />
          <Slider
            label="Ripple Strength"
            value={rippleStrength}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setRippleStrength}
          />
          <Slider
            label="Distortion Strength"
            value={distortionStrength}
            min={0}
            max={1}
            step={0.01}
            onChange={setDistortionStrength}
          />
          <Slider
            label="Wave Speed"
            value={waveSpeed}
            min={0.1}
            max={1}
            step={0.05}
            onChange={setWaveSpeed}
          />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Physics</h3>
          <Slider
            label="Spring Strength"
            value={springStrength}
            min={0.001}
            max={0.02}
            step={0.001}
            onChange={setSpringStrength}
          />
          <Slider
            label="Velocity Damping"
            value={velocityDamping}
            min={0}
            max={0.01}
            step={0.001}
            onChange={setVelocityDamping}
          />
          <Slider
            label="Pressure Damping"
            value={pressureDamping}
            min={0.99}
            max={1}
            step={0.001}
            onChange={setPressureDamping}
          />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Effects</h3>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={enableChromaticAberration}
                onChange={(e) => setEnableChromaticAberration(e.target.checked)}
                className={styles.checkbox}
              />
              Chromatic Aberration
            </label>
          </div>
          {enableChromaticAberration && (
            <Slider
              label="Aberration Strength"
              value={chromaticAberrationStrength}
              min={0}
              max={3}
              step={0.1}
              onChange={setChromaticAberrationStrength}
            />
          )}
        </div>

        <button onClick={resetToDefaults} className={styles.resetButton}>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default ControlledDemo;
