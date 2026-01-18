import React from 'react';
import styles from './App.module.scss';
import { BasicDemo } from './demo/BasicDemo';
import { ControlledDemo } from './demo/ControlledDemo';

const App: React.FC = () => {
  return (
    <div className={styles.app}>
      {/* Basic Demo */}
      <BasicDemo
        imageUrl="/images/webkins.jpg"
        rippleSize={30}
        rippleStrength={1.0}
        distortionStrength={0.2}
        waveSpeed={1.0}
        springStrength={0.005}
        velocityDamping={0.002}
        pressureDamping={0.999}
        enableChromaticAberration={false}
        chromaticAberrationStrength={1.0}
      />

      {/* Controlled Demo */}
      {/* <ControlledDemo
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
      /> */}
    </div>
  );
};

export default App;
