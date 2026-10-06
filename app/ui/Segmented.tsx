import React from 'react';
import {Pressable, StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {Text} from './Text';

interface SegmentedProps<T extends string> {
  options: {value: T; label: string}[];
  value: T;
  onChange: (value: T) => void;
  height?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Segmented<T extends string>({options, value, onChange, height = 40, accessibilityLabel, style}: SegmentedProps<T>) {
  const {colors, isDark} = useTheme();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={[{flexDirection: 'row', gap: 2, padding: 3, borderRadius: 14, backgroundColor: colors.paper2, height}, style]}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{selected: on}}
            style={[
              {flex: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center'},
              on && {backgroundColor: isDark ? colors.paper3 : colors.cardHi, boxShadow: '0px 1px 3px rgba(40,26,10,0.14)'},
            ]}>
            <Text role="label" color={on ? colors.ink : colors.ink2} numberOfLines={1} style={on ? {fontFamily: 'IBMPlexSansArabic-SemiBold'} : undefined}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
