import React, {forwardRef, useState} from 'react';
import {TextInput, TextInputProps, View} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {AR_SERIF, fonts} from '../theme/type';
import {detectScript} from '../lib/text';
import {uiScript} from '../lib/locale';
import {Text} from './Text';
import {Icon, IconName} from './Icon';

interface FieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** e.g. «— اختياري» */
  hint?: string;
  error?: string;
  /** Book titles are content: set them in the reading face. */
  serif?: boolean;
  /** Leading icon (auth fields). */
  icon?: IconName;
  /** After the input, e.g. a show-password button. */
  trailing?: React.ReactNode;
  /** A quiet tick once the value is valid. */
  ok?: boolean;
  /** Forces left-to-right (emails, passwords). */
  ltr?: boolean;
}

/** Label above, quiet input, error below. The input follows the script of
 * what is typed, so an English title in the Arabic UI reads left to right. */
export const Field = forwardRef<TextInput, FieldProps>(({label, hint, error, serif, icon, trailing, ok, ltr, value, onFocus, onBlur, ...rest}, ref) => {
  const {colors} = useTheme();
  const [focused, setFocused] = useState(false);
  const script = detectScript(value, uiScript());
  const rtl = !ltr && script === 'arabic';
  const family = serif ? (rtl ? fonts.thmanyah[500] : fonts.newsreader[500]) : fonts.plex[400];
  const size = serif ? (rtl ? Math.round(20 * AR_SERIF) : 17.5) : 15.5;
  return (
    <View style={{gap: 7}}>
      <Text role="label" tone="ink2">
        {label}
        {hint ? <Text role="label" tone="ink4" style={{fontFamily: fonts.plex[400]}}>{` ${hint}`}</Text> : null}
      </Text>
      <View
        style={{
          height: 50,
          borderRadius: 17,
          backgroundColor: colors.card,
          borderWidth: error ? 1.5 : 1,
          borderColor: error ? colors.danger : focused ? colors.ink : colors.rule,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        {icon ? <Icon name={icon} size={18} color={focused ? colors.ink2 : colors.ink3} /> : null}
        <TextInput
          ref={ref}
          value={value}
          accessibilityLabel={label}
          placeholderTextColor={colors.ink4}
          selectionColor={colors.gold}
          cursorColor={colors.ink}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{flex: 1, alignSelf: 'stretch', fontFamily: family, fontSize: size, color: colors.ink, padding: 0, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr'}}
          {...rest}
          // Focusing a field with an error reads the error, not only the label.
          accessibilityHint={error ?? rest.accessibilityHint}
        />
        {ok && !error ? <Icon name="check" size={16} color={colors.ok} strokeWidth={2} /> : null}
        {trailing}
      </View>
      {error ? (
        <Text role="meta" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
