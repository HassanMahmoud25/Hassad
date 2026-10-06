import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';

const useA11yFlag = (read: () => Promise<boolean>, event: 'reduceMotionChanged' | 'reduceTransparencyChanged') => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    read().then(v => alive && setOn(v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener(event, setOn);
    return () => {
      alive = false;
      sub.remove();
    };
  }, [read, event]);
  return on;
};

export const useReduceMotion = () => useA11yFlag(AccessibilityInfo.isReduceMotionEnabled, 'reduceMotionChanged');

/** iOS only; Android has no such setting and always resolves false. */
export const useReduceTransparency = () =>
  useA11yFlag(AccessibilityInfo.isReduceTransparencyEnabled, 'reduceTransparencyChanged');
