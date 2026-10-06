import React, {forwardRef, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {fonts} from '../theme/type';
import {toWesternDigits} from '../lib/text';
import {Text} from './Text';

interface CodeInputProps {
  value: string;
  onChange: (digits: string) => void;
  length?: number;
  error?: boolean;
  accessibilityLabel: string;
  onComplete?: (digits: string) => void;
  autoFocus?: boolean;
}

/**
 * A short emailed code as separate figures (VerifyEmail board). One hidden
 * field takes the input — paste and Arabic-Indic digits work — and the boxes
 * only draw it. Digits always run left to right, as on the email.
 */
export const CodeInput = forwardRef<TextInput, CodeInputProps>(({value, onChange, length = 4, error, accessibilityLabel, onComplete, autoFocus}, ref) => {
  const {colors} = useTheme();
  const [focused, setFocused] = useState(false);
  const inner = React.useRef<TextInput>(null);
  React.useImperativeHandle(ref, () => inner.current as TextInput);
  const digits = toWesternDigits(value).replace(/\D/g, '').slice(0, length);
  return (
    <Pressable onPress={() => inner.current?.focus()} accessible={false} style={{alignItems: 'center'}}>
      <View style={{flexDirection: 'row', direction: 'ltr', gap: 10}} importantForAccessibility="no-hide-descendants">
        {Array.from({length}, (_, i) => {
          const active = focused && (i === digits.length || (i === length - 1 && digits.length === length));
          return (
            <View
              key={i}
              style={{
                width: 58,
                height: 66,
                borderRadius: 16,
                backgroundColor: colors.card,
                borderWidth: active || error ? 1.5 : 1,
                borderColor: error ? colors.danger : active ? colors.ink : colors.rule,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text role="numeral" script="latin" style={{fontFamily: fonts.newsreader[500], fontSize: 30, lineHeight: 36}}>
                {digits[i] ?? ''}
              </Text>
              {active && digits.length < length ? <View style={{position: 'absolute', width: 2, height: 26, borderRadius: 1, backgroundColor: colors.gold}} /> : null}
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inner}
        value={digits}
        onChangeText={v => {
          const d = toWesternDigits(v).replace(/\D/g, '').slice(0, length);
          onChange(d);
          if (d.length === length) {
            onComplete?.(d);
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length + 2}
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel}
        caretHidden
        style={{position: 'absolute', opacity: 0.01, width: 1, height: 1}}
      />
    </Pressable>
  );
});
