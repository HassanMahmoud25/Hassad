import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleProp, ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {useReduceMotion} from '../lib/a11y';

/** A slow breath, not a shimmer stripe (Design Lock v2 §14). */
export const Skeleton = ({width, height, radius = 8, style}: {width: ViewStyle['width']; height: number; radius?: number; style?: StyleProp<ViewStyle>}) => {
  const {colors} = useTheme();
  const reduce = useReduceMotion();
  const opacity = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    if (reduce) {
      opacity.setValue(0.8);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 0.55, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, opacity]);
  return <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity}, style]} />;
};
