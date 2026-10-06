import React, {ReactNode} from 'react';
import {Platform, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '../theme/ThemeProvider';
import {useReduceTransparency} from '../lib/a11y';

interface GlassProps {
  radius: number;
  /** Sheets and anything holding text over busy content. */
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Glass is only for what floats: the tab capsule, the capture bar, sheets and
 * banners (Design Lock v2 §07). Real blur on iOS; Android and Reduce
 * Transparency get an opaque fill, which reads the same at a glance and never
 * turns muddy over a cover.
 */
export const Glass = ({radius, strong, style, children}: GlassProps) => {
  const {colors, isDark} = useTheme();
  const reduce = useReduceTransparency();
  const blur = Platform.OS === 'ios' && !reduce;
  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: colors.glassLine,
          boxShadow: isDark
            ? '0px 16px 38px -10px rgba(0,0,0,0.6)'
            : '0px 14px 34px -10px rgba(58,40,14,0.24), 0px 2px 6px rgba(58,40,14,0.06)',
        },
        // Without real blur, sheets (strong) get a solid fill so forms never
        // show the screen beneath through their text.
        !blur && {backgroundColor: strong ? colors.card : colors.glassStrong},
        style,
      ]}>
      {blur && (
        <View style={[StyleSheet.absoluteFill, {borderRadius: radius, overflow: 'hidden'}]} pointerEvents="none">
          <BlurView style={StyleSheet.absoluteFill} blurType={isDark ? 'dark' : 'light'} blurAmount={22} reducedTransparencyFallbackColor={colors.glassStrong} />
          <View style={[StyleSheet.absoluteFill, {backgroundColor: strong ? colors.glassStrong : colors.glass}]} />
        </View>
      )}
      {children}
    </View>
  );
};
