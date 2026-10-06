import React from 'react';
import {View} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';
import {useTheme} from '../../theme/ThemeProvider';
import {BrandSeal, Icon} from '../../ui';

/** A plain paper envelope; the Hassad seal closes it until the address is confirmed. */
export const Envelope = ({sealed}: {sealed: boolean}) => {
  const {colors} = useTheme();
  return (
    <View style={{width: 190, height: 128, alignItems: 'center', justifyContent: 'center'}} importantForAccessibility="no-hide-descendants">
      <Svg width={190} height={128} style={{position: 'absolute'}}>
        <Rect x={1} y={1} width={188} height={126} rx={6} fill={colors.card} stroke={colors.rule} strokeWidth={1} />
        <Path d="M2 3 L95 70 L188 3" fill="none" stroke={colors.rule} strokeWidth={1.2} />
        <Path d="M2 125 L72 54 M188 125 L118 54" fill="none" stroke={colors.rule2} strokeWidth={1} />
      </Svg>
      {/* Sealed until confirmed; then the seal gives way to a tick. */}
      <View style={{marginTop: 26, boxShadow: '0px 6px 12px -6px rgba(90,60,10,0.5)', borderRadius: 30}}>
        {sealed ? (
          <BrandSeal size={56} />
        ) : (
          <View style={{width: 56, height: 56, borderRadius: 28, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center'}}>
            <Icon name="check" size={28} color={colors.onInk} strokeWidth={2} />
          </View>
        )}
      </View>
    </View>
  );
};
