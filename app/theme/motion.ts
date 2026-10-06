import {Easing} from 'react-native';

// Design Lock v2 §15: three durations, one curve. Nothing bounces.
export const motion = {
  quick: 120, // press, toggle
  base: 220, // sheets, fades
  slow: 360, // page-level transitions
  ease: Easing.bezier(0.2, 0.7, 0.2, 1),
} as const;
