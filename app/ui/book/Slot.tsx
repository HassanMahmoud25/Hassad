import React from 'react';
import {I18nManager, Pressable, StyleProp, View, ViewStyle} from 'react-native';
import Svg, {Defs, Line, Pattern, Rect} from 'react-native-svg';
import {useTheme} from '../../theme/ThemeProvider';
import {Icon} from '../Icon';

interface SlotProps {
  width: number;
  height?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** An empty place on a shelf, the size of a book. */
export const Slot = ({width, height, onPress, accessibilityLabel, style}: SlotProps) => {
  const {colors} = useTheme();
  const h = height ?? Math.round(width * 1.5);
  // Same corner logic as an Arabic-bound book: spine on the physical right.
  const spineIsStart = I18nManager.isRTL;
  const corners: ViewStyle = spineIsStart
    ? {borderTopStartRadius: 3, borderBottomStartRadius: 3, borderTopEndRadius: 7, borderBottomEndRadius: 7}
    : {borderTopStartRadius: 7, borderBottomStartRadius: 7, borderTopEndRadius: 3, borderBottomEndRadius: 3};
  const body = (
    <View style={[{width, height: h, borderWidth: 1.5, borderColor: colors.rule, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}, corners, style]}>
      <Svg width={width} height={h} style={{position: 'absolute'}}>
        <Defs>
          <Pattern id="hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Line x1={0} y1={0} x2={0} y2={6} stroke={colors.rule2} strokeWidth={1.4} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width={width} height={h} fill="url(#hatch)" />
      </Svg>
      {onPress && <Icon name="plus" size={20} color={colors.ink3} />}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
      {body}
    </Pressable>
  ) : (
    body
  );
};
