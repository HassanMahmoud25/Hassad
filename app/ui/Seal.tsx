import React from 'react';
import {Pressable, Text as RNText, View} from 'react-native';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';
import {useTheme} from '../theme/ThemeProvider';
import {fonts} from '../theme/type';
import {detectScript} from '../lib/text';

interface SealProps {
  /** The reader's name, or their email when the name isn't known. */
  name: string;
  size?: number;
  onPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

/**
 * The reader's monogram as an ex-libris seal: an oxblood disc with the
 * initial in foil, ringed in paper and gold (Profile board). It stands for
 * the reader everywhere — never a generic avatar circle.
 */
export const Seal = ({name, size = 42, onPress, accessibilityLabel, accessibilityHint}: SealProps) => {
  const {colors} = useTheme();
  const initial = [...name.trim()][0] ?? '·';
  const latin = detectScript(initial, 'arabic') === 'latin';
  const disc = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        // Paper ring, then a gold hairline, then the cast shadow (Profile board).
        boxShadow: size >= 64
          ? `0px 0px 0px 4px ${colors.paper}, 0px 0px 0px 5px ${colors.goldSoft}, 0px 14px 30px -12px rgba(70,24,18,0.6)`
          : `0px 0px 0px 2px ${colors.paper}, 0px 0px 0px 3px ${colors.goldSoft}, 0px 8px 16px -8px rgba(70,24,18,0.55)`,
      }}>
      <Svg width={size} height={size} style={{position: 'absolute'}}>
        <Defs>
          <RadialGradient id="seal" cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor="#8A3830" />
            <Stop offset="1" stopColor="#5A221E" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#seal)" />
      </Svg>
      <RNText
        allowFontScaling={false}
        style={{
          fontFamily: latin ? fonts.newsreader[500] : fonts.thmanyah[500],
          fontSize: size * (latin ? 0.46 : 0.42),
          lineHeight: size * (latin ? 0.56 : 0.62),
          color: '#E9D3A2',
          textAlign: 'center',
          textTransform: 'uppercase',
          marginTop: latin ? 0 : -size * 0.04,
        }}>
        {initial}
      </RNText>
    </View>
  );
  return onPress ? (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={6}
      // A seal is pressed, not dimmed.
      style={({pressed}) => ({padding: 3, transform: [{scale: pressed ? 0.92 : 1}]})}>
      {disc}
    </Pressable>
  ) : (
    <View accessibilityLabel={accessibilityLabel} style={{padding: 3}}>
      {disc}
    </View>
  );
};
