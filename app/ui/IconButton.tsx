import React from 'react';
import {Pressable, StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {Icon, IconName} from './Icon';
import {Glass} from './Glass';

export type IconButtonVariant = 'plain' | 'fill' | 'glass' | 'tint' | 'ink' | 'bare';

interface IconButtonProps {
  icon: IconName;
  /** Required: icon buttons have no visible label. */
  label: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  small?: boolean;
  color?: string;
  filled?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const IconButton = ({icon, label, onPress, variant = 'plain', small, color, filled, disabled, style}: IconButtonProps) => {
  const {colors} = useTheme();
  const size = small ? 36 : 42;
  const fg =
    color ?? (variant === 'tint' ? '#F6EEDF' : variant === 'ink' ? colors.onInk : colors.ink);
  const base: ViewStyle = {width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center'};
  const surface: ViewStyle =
    variant === 'plain'
      ? {borderWidth: 1, borderColor: colors.rule}
      : variant === 'fill'
      ? {backgroundColor: colors.paper2}
      : variant === 'tint'
      ? {backgroundColor: 'rgba(16,9,6,0.24)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'}
      : variant === 'ink'
      ? {backgroundColor: colors.ink}
      : {};
  const glyph = <Icon name={icon} size={small ? 18 : 20} color={fg} filled={filled} />;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: !!disabled}}
      hitSlop={small ? 6 : 2}
      style={({pressed}) => [{opacity: disabled ? 0.4 : pressed ? 0.6 : 1}, style]}>
      {variant === 'glass' ? (
        <Glass radius={size / 2} style={base}>
          {glyph}
        </Glass>
      ) : (
        <View style={[base, surface]}>{glyph}</View>
      )}
    </Pressable>
  );
};
