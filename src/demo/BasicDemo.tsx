import React from 'react';
import { RippleEffect, RippleEffectProps } from '../RippleEffect';
import styles from './BasicDemo.module.scss';

export interface BasicDemoProps extends Omit<RippleEffectProps, 'className' | 'style'> {}

export const BasicDemo: React.FC<BasicDemoProps> = (props) => {
  return (
    <div className={styles.container}>
      <RippleEffect {...props} />
    </div>
  );
};

export default BasicDemo;
