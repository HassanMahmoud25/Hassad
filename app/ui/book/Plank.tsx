import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {useTheme} from '../../theme/ThemeProvider';

/** The board books stand on. Furniture, not a card: 9pt, inset 12 from the
 * row, lit from above. */
export const Plank = ({style}: {style?: StyleProp<ViewStyle>}) => {
  const {colors, isDark} = useTheme();
  return (
    <View
      style={[
        {
          height: 9,
          marginHorizontal: 12,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          backgroundColor: colors.plankBottom,
          boxShadow: isDark
            ? '0px 8px 14px -6px rgba(0,0,0,0.8), inset 0px 1px 0px rgba(255,255,255,0.06)'
            : '0px 8px 12px -8px rgba(40,26,10,0.4), inset 0px 1px 0px rgba(255,255,255,0.55)',
        },
        style,
      ]}>
      <Svg width="100%" height="100%" style={{position: 'absolute', borderRadius: 3}}>
        <Defs>
          <LinearGradient id="plank" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.plankTop} />
            <Stop offset="1" stopColor={colors.plankBottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" rx="2" fill="url(#plank)" />
      </Svg>
    </View>
  );
};
