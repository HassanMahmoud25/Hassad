import React from 'react';
import {Pressable, StyleProp, ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {Text} from './Text';
import {Icon, IconName} from './Icon';

interface ChipProps {
  label: string;
  on?: boolean;
  line?: boolean;
  small?: boolean;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Chip = ({label, on, line, small, icon, onPress, style}: ChipProps) => {
  const {colors} = useTheme();
  const fg = on ? colors.onInk : line ? colors.ink : colors.ink2;
  const h = small ? 26 : 34;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? {selected: !!on} : undefined}
      style={({pressed}) => [
        {
          height: h,
          borderRadius: h / 2,
          paddingHorizontal: small ? 10 : 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          backgroundColor: on ? colors.ink : line ? 'transparent' : colors.paper2,
          borderWidth: line && !on ? 1 : 0,
          borderColor: colors.rule,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}>
      {icon && <Icon name={icon} size={small ? 14 : 16} color={fg} />}
      <Text role="label" color={fg} numberOfLines={1} style={small ? {fontSize: 11.5, lineHeight: 16} : undefined}>
        {label}
      </Text>
    </Pressable>
  );
};
