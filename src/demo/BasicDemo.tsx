import React from 'react';
import { RippleEffect } from '../RippleEffect';
import styles from './BasicDemo.module.scss';

export const BasicDemo: React.FC = () => {
  return (
    <div className={styles.container}>
      <RippleEffect imageUrl="/images/tiedye.jpg" />
    </div>
  );
};

export default BasicDemo;
