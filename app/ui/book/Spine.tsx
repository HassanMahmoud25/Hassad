import React from 'react';
import {StyleProp, StyleSheet, Text as RNText, View, ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {useTheme} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/type';
import {detectScript} from '../../lib/text';
import {coverSeed, coverTitle, designFor, hash} from './coverDesign';

interface SpineProps {
  seed: string;
  /** Uploaded covers have no known cloth; they get a neutral binding. */
  hasPhoto?: boolean;
  height: number;
  width?: number;
  /** Set along the spine, reading top to bottom. */
  title?: string;
  lean?: boolean;
}

const PHOTO_CLOTH = '#6E6252';

/** A book seen from the shelf: cloth, two foil bands, a rounded top, and —
 * when wide enough — its title along the spine. */
export const Spine = ({seed, hasPhoto, height, width = 13, title, lean}: SpineProps) => {
  const binding = designFor(title ? coverSeed(title) : seed).binding;
  const cloth = hasPhoto ? PHOTO_CLOTH : binding.cloth;
  const ink = hasPhoto ? '#EEE7DA' : binding.text;
  const id = `s${hash(seed, 2).toString(36)}`;
  const latin = title ? detectScript(title, 'arabic') === 'latin' : false;
  const size = latin ? Math.min(13, width * 0.34) : Math.min(12.5, width * 0.33);
  return (
    <View
      accessible={!!title}
      accessibilityLabel={title}
      style={[
        {width, height, backgroundColor: cloth, borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden'},
        lean && {transform: [{rotate: '-8deg'}], marginStart: 10},
      ]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`sh${id}`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000" stopOpacity={0.18} />
            <Stop offset="0.4" stopColor="#fff" stopOpacity={0.08} />
            <Stop offset="1" stopColor="#000" stopOpacity={0.16} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#sh${id})`} />
        <Rect x={0} y={height * 0.12} width={width} height={Math.max(1, height * 0.02)} fill="#E2C68C" fillOpacity={0.55} />
        <Rect x={0} y={height * 0.84} width={width} height={Math.max(1, height * 0.02)} fill="#E2C68C" fillOpacity={0.55} />
      </Svg>
      {title && width >= 24 ? (
        // Rotated a quarter turn clockwise, like `writing-mode: vertical-rl`.
        <View
          pointerEvents="none"
          style={{position: 'absolute', width: height * 0.66, height: width, top: (height - width) / 2, left: (width - height * 0.66) / 2, alignItems: 'center', justifyContent: 'center', transform: [{rotate: '90deg'}]}}>
          <RNText
            numberOfLines={1}
            allowFontScaling={false}
            style={{fontFamily: latin ? fonts.newsreader[500] : fonts.thmanyah[500], fontSize: size, color: ink, textAlign: 'center', writingDirection: latin ? 'ltr' : 'rtl'}}>
            {coverTitle(title)}
          </RNText>
        </View>
      ) : null}
    </View>
  );
};

/** The recessed case a shelf's spines stand in (Shelf screen, pickers). */
export const SpineCase = ({children, height = 100, style}: {children: React.ReactNode; height?: number; style?: StyleProp<ViewStyle>}) => {
  const {colors, isDark} = useTheme();
  return (
    <View
      style={[
        {
          height,
          borderRadius: 16,
          backgroundColor: colors.paper2,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 3,
          paddingHorizontal: 16,
          overflow: 'hidden',
          boxShadow: isDark
            ? `inset 0px 10px 16px -8px rgba(0,0,0,0.7), inset 0px -4px 0px ${colors.paper3}`
            : `inset 0px 10px 16px -10px rgba(40,26,10,0.38), inset 0px -4px 0px ${colors.paper3}`,
        },
        style,
      ]}>
      {children}
    </View>
  );
};
