import React from 'react';
import {ActivityIndicator, Pressable, StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {Text} from './Text';
import {Icon, IconName} from './Icon';

export type ButtonVariant = 'ink' | 'line' | 'soft' | 'gold' | 'danger';
type Size = 'md' | 'sm' | 'xs';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: Size;
  icon?: IconName;
  /** After the label, e.g. a "next" chevron. Mirrors in RTL with the icon set. */
  iconEnd?: IconName;
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<Size, {height: number; pad: number; font: number; icon: number}> = {
  md: {height: 52, pad: 24, font: 15, icon: 20},
  sm: {height: 38, pad: 16, font: 13.5, icon: 18},
  xs: {height: 32, pad: 13, font: 12.5, icon: 16},
};

export const Button = ({label, onPress, variant = 'ink', size = 'md', icon, iconEnd, block, loading, disabled, accessibilityHint, style}: ButtonProps) => {
  const {colors, isDark} = useTheme();
  const s = SIZES[size];
  const look: Record<ButtonVariant, {bg?: string; fg: string; border?: string}> = {
    ink: {bg: colors.ink, fg: colors.onInk},
    line: {fg: colors.ink, border: colors.rule},
    soft: {bg: colors.paper2, fg: colors.ink},
    gold: {bg: colors.gold, fg: '#1E170C'},
    // Night's danger is a light clay, so it takes dark text.
    danger: {bg: colors.danger, fg: isDark ? '#1E100D' : '#FFF7F2'},
  };
  const v = look[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{disabled: !!disabled, busy: !!loading}}
      hitSlop={size === 'xs' ? 6 : 0}
      style={({pressed}) => [
        {
          height: s.height,
          borderRadius: s.height / 2,
          paddingHorizontal: s.pad,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          alignSelf: block ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.4 : 1,
          transform: [{scale: pressed ? 0.98 : 1}],
        },
        pressed && {opacity: 0.86},
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={s.icon} color={v.fg} strokeWidth={1.7} />}
          <View>
            <Text role="button" color={v.fg} numberOfLines={1} style={{fontSize: s.font}}>
              {label}
            </Text>
          </View>
          {iconEnd && <Icon name={iconEnd} size={s.icon - 2} color={v.fg} strokeWidth={1.7} />}
        </>
      )}
    </Pressable>
  );
};
