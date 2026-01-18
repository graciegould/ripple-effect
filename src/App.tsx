import React from 'react';
import styles from './App.module.scss';
// import { BasicDemo, ControlledDemo } from './demo';
import { RippleEffect } from './RippleEffect';

const App: React.FC = () => {
  return (
    <div className={styles.app}>
      {/* Basic Demo */}
      <RippleEffect
        imageUrl="/images/tiedye.jpg"
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
      {/* <RippleEffect
        imageUrl="/images/water.jpg"
        rippleSize={30}
        rippleStrength={1.0}
        distortionStrength={0.2}
        waveSpeed={1.0}
        springStrength={0.005}
        velocityDamping={0.002}
        pressureDamping={0.999}
        enableChromaticAberration={false}
        chromaticAberrationStrength={1.0}
      /> */}
    </div>
  );
};

export default App;
