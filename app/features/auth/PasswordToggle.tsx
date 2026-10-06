import React from 'react';
import {Pressable} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {useT} from '../../lib/i18n';
import {Icon} from '../../ui';

/** Show/hide password: a 44pt target that says what it will do. */
export const PasswordToggle = ({visible, onToggle}: {visible: boolean; onToggle: () => void}) => {
  const {colors} = useTheme();
  const {t} = useT();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={visible ? t('auth.hidePassword') : t('auth.showPassword')}
      hitSlop={12}
      style={({pressed}) => ({width: 32, height: 44, alignItems: 'center', justifyContent: 'center', marginEnd: -6, opacity: pressed ? 0.5 : 1})}>
      <Icon name={visible ? 'eyeOff' : 'eye'} size={20} color={colors.ink3} />
    </Pressable>
  );
};
