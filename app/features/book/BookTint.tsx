import React from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import Svg, {Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop} from 'react-native-svg';
import {useTheme} from '../../theme/ThemeProvider';
import {bookTint} from '../../theme/tokens';

/** The book's own colour, softened, lights the top of its screen
 * (Design Lock v2 §06): a pastel of the cloth on Paper, the cloth itself
 * deepened on Night. Fades into the paper below. */
export const BookTint = ({cloth, height = 470}: {cloth: string; height?: number}) => {
  const {name, colors} = useTheme();
  const {width} = useWindowDimensions();
  const t = bookTint(cloth, name);
  const dark = name === 'dark';
  const midAt = dark ? 0.6 : 0.62;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, {height}]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="tint" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.top} />
            <Stop offset={String(midAt)} stopColor={t.mid} />
            <Stop offset="1" stopColor={colors.paper} />
          </LinearGradient>
          <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={t.glow} stopOpacity={1} />
            <Stop offset="0.7" stopColor={t.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#tint)" />
        <Ellipse cx={width / 2} cy={height * (dark ? 0.28 : 0.3)} rx={dark ? 260 : 240} ry={dark ? 220 : 200} fill="url(#glow)" />
      </Svg>
    </View>
  );
};
