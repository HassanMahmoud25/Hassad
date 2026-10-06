import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {Animated, I18nManager, LayoutChangeEvent, Pressable, StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {motion} from '../theme/motion';
import {useReduceMotion} from '../lib/a11y';

export interface SwitcherOption<T extends string> {
  value: T;
  /** Spoken name of the option. */
  label: string;
  /** Draws the option in a given colour (called for both layers). */
  render: (color: string) => ReactNode;
}

interface SwitcherProps<T extends string> {
  options: SwitcherOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Hassad's preference switch: a paper track with an ink thumb that slides to
 * the chosen option. The labels under the thumb are a second, ink-coloured
 * layer clipped to the thumb, so each label changes colour exactly where the
 * thumb passes over it. Mirrors in RTL; at night the ink thumb is cream.
 */
export function Switcher<T extends string>({options, value, onChange, accessibilityLabel, height = 50, style}: SwitcherProps<T>) {
  const {colors, isDark, name} = useTheme();
  const reduce = useReduceMotion();
  const pad = 4;
  const [width, setWidth] = useState(0);
  const seg = width > 0 ? (width - pad * 2) / options.length : 0;
  const index = Math.max(0, options.findIndex(o => o.value === value));
  const dir = I18nManager.isRTL ? -1 : 1;
  const x = useRef(new Animated.Value(0)).current;
  const pressed = useRef(new Animated.Value(1)).current;
  const placed = useRef(false);

  useEffect(() => {
    if (!seg) {
      return;
    }
    const to = index * seg * dir;
    if (!placed.current || reduce) {
      x.setValue(to);
      placed.current = true;
      return;
    }
    Animated.timing(x, {toValue: to, duration: motion.base, easing: motion.ease, useNativeDriver: true}).start();
  }, [index, seg, dir, reduce, x]);

  const squeeze = (to: number) => Animated.timing(pressed, {toValue: to, duration: motion.quick, useNativeDriver: true}).start();
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const r = (height - pad * 2) / 2;

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      style={[{height, borderRadius: height / 2, backgroundColor: colors.paper2, borderWidth: 1, borderColor: colors.rule2}, style]}>
      {/* Resting labels */}
      <View style={{position: 'absolute', top: pad - 1, bottom: pad - 1, start: pad - 1, end: pad - 1, flexDirection: 'row'}} pointerEvents="none">
        {options.map(o => (
          <View key={o.value} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} importantForAccessibility="no-hide-descendants">
            {o.render(colors.ink2)}
          </View>
        ))}
      </View>
      {/* The thumb, carrying its own copy of the labels */}
      {seg > 0 && (
        <Animated.View
          // Fabric keeps the old colours on a natively animated view when
          // the theme changes; remounting on theme picks up the new ones.
          key={name}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: pad - 1,
            bottom: pad - 1,
            start: pad - 1,
            width: seg,
            borderRadius: r,
            backgroundColor: colors.ink,
            overflow: 'hidden',
            boxShadow: isDark ? '0px 4px 10px -4px rgba(0,0,0,0.7)' : '0px 4px 10px -4px rgba(28,20,8,0.45)',
            transform: [{translateX: x}, {scale: pressed}],
          }}>
          <Animated.View style={{position: 'absolute', top: 0, bottom: 0, start: 0, width: seg * options.length, flexDirection: 'row', transform: [{translateX: Animated.multiply(x, -1)}]}}>
            {options.map(o => (
              <View key={o.value} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} importantForAccessibility="no-hide-descendants">
                {o.render(colors.onInk)}
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      )}
      {/* Touch targets */}
      <View style={{flex: 1, flexDirection: 'row', padding: pad - 1}}>
        {options.map(o => {
          const on = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => !on && onChange(o.value)}
              onPressIn={() => on && squeeze(0.96)}
              onPressOut={() => squeeze(1)}
              accessibilityRole="radio"
              accessibilityState={{checked: on}}
              accessibilityLabel={o.label}
              style={{flex: 1, minHeight: 44, borderRadius: r}}
            />
          );
        })}
      </View>
    </View>
  );
}
