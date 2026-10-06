import React, {memo, useState} from 'react';
import {I18nManager, Image, StyleProp, StyleSheet, Text as RNText, TextStyle, View, ViewStyle} from 'react-native';
import Svg, {Defs, Line, LinearGradient, Pattern, Rect, Stop} from 'react-native-svg';
import {BindingId, luminance, withAlpha} from '../../theme/tokens';
import {fonts} from '../../theme/type';
import {bindLatinRuns, detectScript} from '../../lib/text';
import {Composition, coverSeed, coverTitle, designFor, hash, MAX_LINES, titleSize} from './coverDesign';

export type CoverShadow = 'none' | 'shelf' | 'grid' | 'hero';

export interface CoverProps {
  /** Only distinguishes SVG gradient ids; the design comes from the title. */
  seed?: string;
  title: string;
  author?: string;
  /** Uploaded cover photo. When present it always replaces the design. */
  imageUrl?: string | null;
  width: number;
  height?: number;
  shadow?: CoverShadow;
  composition?: Composition;
  binding?: BindingId;
  /** Inside a button that already names the book: hide from screen readers. */
  decorative?: boolean;
  style?: StyleProp<ViewStyle>;
}

const FOIL = '#E2C68C';
const PANEL = '#F4ECDF'; // colour-block lower panel
const PANEL_TEXT = '#221A14';

/**
 * A book as an object: 2:3, cloth or photo, spine shade on the binding side
 * (right for Arabic titles, left for Latin — by the title's script, not the
 * UI language), radius 7 at the fore-edge and 3 at the spine.
 */
export const Cover = memo(
  ({seed, title, author, imageUrl, width, height, shadow = 'grid', composition, binding, decorative, style}: CoverProps) => {
    const h = height ?? Math.round(width * 1.5);
    const [photoFailed, setPhotoFailed] = useState(false);
    const isPhoto = !!imageUrl && !photoFailed;
    const design = designFor(coverSeed(title), {composition, binding});
    const cloth = design.binding.cloth;
    const latin = detectScript(title, 'arabic') === 'latin';
    const spineOnRight = !latin;
    // The hero shadow takes the cloth's colour — unless the cloth is pale,
    // where a cloth-coloured shadow would vanish into Paper.
    const heroShadow = isPhoto || luminance(cloth) > 0.4 ? '#3A280E' : cloth;

    // Logical corner props follow the UI direction, so translate the
    // physical spine side into start/end.
    const spineIsStart = spineOnRight === I18nManager.isRTL;
    const corners: ViewStyle = spineIsStart
      ? {borderTopStartRadius: 3, borderBottomStartRadius: 3, borderTopEndRadius: 7, borderBottomEndRadius: 7}
      : {borderTopStartRadius: 7, borderBottomStartRadius: 7, borderTopEndRadius: 3, borderBottomEndRadius: 3};

    const boxShadow =
      shadow === 'none'
        ? undefined
        : shadow === 'shelf'
        ? '0px 1px 1px rgba(30,20,8,0.12), 0px 8px 12px -8px rgba(40,26,10,0.45)'
        : shadow === 'hero'
        ? `0px 2px 2px rgba(30,10,8,0.16), 0px 22px 34px -14px ${withAlpha(heroShadow, 0.6)}, 0px 40px 60px -30px ${withAlpha(heroShadow, 0.5)}`
        : '0px 1px 1px rgba(30,20,8,0.12), 0px 10px 18px -8px rgba(40,26,10,0.42), 0px 26px 40px -24px rgba(40,26,10,0.5)';

    return (
      <View
        accessible={!decorative}
        importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
        accessibilityRole={decorative ? undefined : 'image'}
        accessibilityLabel={decorative ? undefined : author ? `${title} — ${author}` : title}
        style={[{width, height: h}, corners, boxShadow ? {boxShadow} : null, style]}>
        <View style={[StyleSheet.absoluteFill, corners, {overflow: 'hidden', backgroundColor: isPhoto ? '#D8CFC0' : cloth}]}>
          {isPhoto ? (
            <Image source={{uri: imageUrl!}} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setPhotoFailed(true)} />
          ) : width < 30 ? null : (
            // Below ~30pt type turns to noise: a tiny book is just its cloth.
            <Composed composition={design.composition} title={title} author={author} width={width} height={h} textColor={design.binding.text} lightCloth={design.binding.light} latin={latin} />
          )}
          <Surface width={width} height={h} spineOnRight={spineOnRight} cloth={!isPhoto} seed={seed ?? title} />
        </View>
      </View>
    );
  },
);

/** Spine shade, top-left light, and (on cloth) a faint weave. SVG draws in
 * physical coordinates, so the spine side here is literal. */
const Surface = ({width, height, spineOnRight, cloth, seed}: {width: number; height: number; spineOnRight: boolean; cloth: boolean; seed: string}) => {
  const id = `c${hash(seed, 1).toString(36)}`;
  const edge = spineOnRight ? width : 0;
  const inward = spineOnRight ? -1 : 1;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={`sp${id}`} x1={edge} y1={0} x2={edge + inward * 13} y2={0} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#000" stopOpacity={cloth ? 0.32 : 0.22} />
          <Stop offset="0.19" stopColor="#fff" stopOpacity={cloth ? 0.17 : 0.14} />
          <Stop offset="0.46" stopColor="#000" stopOpacity={cloth ? 0.12 : 0.06} />
          <Stop offset="1" stopColor="#000" stopOpacity={0} />
        </LinearGradient>
        {/* Light falls from the fore-edge side, about 18° off vertical. */}
        <LinearGradient id={`lt${id}`} x1={spineOnRight ? 0.34 : 0.66} y1={0} x2={spineOnRight ? 0.66 : 0.34} y2={1}>
          <Stop offset="0" stopColor="#fff" stopOpacity={cloth ? 0.15 : 0.1} />
          <Stop offset={cloth ? '0.36' : '0.4'} stopColor="#fff" stopOpacity={0} />
          <Stop offset="1" stopColor="#000" stopOpacity={cloth ? 0.18 : 0.1} />
        </LinearGradient>
        {cloth && (
          <Pattern id={`wv${id}`} width={3} height={3} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Line x1={0} y1={0} x2={0} y2={3} stroke="#fff" strokeOpacity={0.035} strokeWidth={1} />
          </Pattern>
        )}
      </Defs>
      {cloth && <Rect x={0} y={0} width={width} height={height} fill={`url(#wv${id})`} />}
      <Rect x={0} y={0} width={width} height={height} fill={`url(#lt${id})`} />
      <Rect x={spineOnRight ? width - 14 : 0} y={0} width={14} height={height} fill={`url(#sp${id})`} />
    </Svg>
  );
};

interface ComposedProps {
  composition: Composition;
  title: string;
  author?: string;
  width: number;
  height: number;
  textColor: string;
  lightCloth: boolean;
  latin: boolean;
}

/** Physical left/right. RN swaps left and right in RTL layouts, so the
 * literal side has to be translated back. */
const physical = (side: 'left' | 'right', value: number): ViewStyle =>
  I18nManager.isRTL ? (side === 'left' ? {right: value} : {left: value}) : {[side]: value};

const Composed = ({composition, title: fullTitle, author, width: w, height: h, textColor, lightCloth, latin}: ComposedProps) => {
  const title = bindLatinRuns(coverTitle(fullTitle));
  // Text inside a cover follows the book's script, not the UI direction.
  // Paddings mirror the canvas, where CSS % padding is a share of the width.
  const bookIsRTL = !latin;
  // The book's own inline start and end, as physical sides.
  const bookStart = latin ? 'left' : 'right';
  const bookEnd = latin ? 'right' : 'left';
  const sameDir = bookIsRTL === I18nManager.isRTL;
  const startAlign: TextStyle['textAlign'] = sameDir ? 'left' : 'right';
  const startItems: ViewStyle['alignItems'] = sameDir ? 'flex-start' : 'flex-end';
  const titleFont = latin ? fonts.newsreader[500] : fonts.thmanyah[500];
  const size = titleSize(composition, title, w, latin);
  const authorSize = Math.max(5, Math.round(w * 0.062 * 10) / 10);
  const authorStyle: TextStyle = {
    fontFamily: fonts.plex[500],
    fontSize: authorSize,
    lineHeight: authorSize * 1.3,
    color: composition === 'block' ? PANEL_TEXT : textColor,
    opacity: 0.78,
    letterSpacing: latin ? authorSize * 0.08 : 0,
    textTransform: latin ? 'uppercase' : 'none',
  };
  const titleText = (color: string, align: TextStyle['textAlign']) => (
    <RNText
      numberOfLines={MAX_LINES[composition]}
      allowFontScaling={false}
      style={{
        fontFamily: titleFont,
        fontSize: size,
        lineHeight: size * (composition === 'type' ? (latin ? 1.0 : 1.08) : latin ? 1.08 : 1.18),
        letterSpacing: latin ? -size * 0.01 : 0,
        color,
        textAlign: align,
        writingDirection: latin ? 'ltr' : 'rtl',
      }}>
      {title}
    </RNText>
  );
  const authorText = (align: TextStyle['textAlign']) =>
    author ? (
      <RNText numberOfLines={1} allowFontScaling={false} style={[authorStyle, {textAlign: align}]}>
        {author}
      </RNText>
    ) : null;
  const rule = (color: string, widthPct: number, margin: number, self?: ViewStyle['alignSelf']) => (
    <View style={{width: `${widthPct}%`, height: 1, backgroundColor: color, opacity: 0.5, marginTop: margin, alignSelf: self}} />
  );

  switch (composition) {
    case 'framed':
      return (
        <>
          <View style={{position: 'absolute', top: w * 0.06, bottom: w * 0.06, start: w * 0.06, end: w * 0.06, borderWidth: 1, borderColor: textColor, opacity: 0.32, borderRadius: 2}} />
          <View style={{flex: 1, alignItems: 'center', paddingTop: w * 0.15, paddingHorizontal: w * 0.14, paddingBottom: w * 0.11}}>
            {titleText(textColor, 'center')}
            {rule(textColor, 34, w * 0.09)}
            <View style={{flex: 1}} />
            {authorText('center')}
          </View>
        </>
      );
    case 'band':
      return (
        <>
          <View style={{position: 'absolute', start: 0, end: 0, top: h * 0.2, height: h * 0.36, borderTopWidth: 1, borderBottomWidth: 1, borderColor: textColor, backgroundColor: 'rgba(255,240,210,0.08)', justifyContent: 'center', paddingHorizontal: w * 0.12}}>
            <View style={{position: 'absolute', top: 3, start: 0, end: 0, height: 1, backgroundColor: textColor, opacity: 0.5}} />
            <View style={{position: 'absolute', bottom: 3, start: 0, end: 0, height: 1, backgroundColor: textColor, opacity: 0.5}} />
            {titleText(textColor, 'center')}
          </View>
          <View style={{position: 'absolute', bottom: w * 0.09, start: w * 0.14, end: w * 0.14}}>{authorText('center')}</View>
        </>
      );
    case 'minimal':
    case 'orb':
      return (
        <>
          {composition === 'orb' && (
            <>
              <View style={[{position: 'absolute', width: w * 1.18, height: w * 1.18, borderRadius: w, top: -h * 0.34, backgroundColor: 'rgba(255,255,255,0.13)'}, physical(bookEnd, -w * 0.48)]} />
              <View style={[{position: 'absolute', width: w * 0.24, height: w * 0.24, borderRadius: w, top: h * 0.15, backgroundColor: lightCloth ? '#5A221E' : FOIL}, physical(bookStart, w * 0.14)]} />
            </>
          )}
          <View style={{flex: 1, alignItems: startItems, paddingTop: w * 0.13, paddingHorizontal: w * 0.12, paddingBottom: w * 0.12}}>
            {authorText(startAlign)}
            <View style={{flex: 1}} />
            {titleText(textColor, startAlign)}
            {composition === 'minimal' && rule(textColor, 22, w * 0.07)}
          </View>
        </>
      );
    case 'block':
      return (
        <View style={{flex: 1}}>
          <View style={{flex: 1.3, overflow: 'hidden'}}>
            <View style={[{position: 'absolute', width: w * 0.62, height: w * 0.62, borderRadius: w, bottom: -h * 0.147, backgroundColor: 'rgba(255,255,255,0.2)'}, physical(bookEnd, -w * 0.1)]} />
          </View>
          <View style={{flex: 1, backgroundColor: PANEL, paddingVertical: w * 0.09, paddingHorizontal: w * 0.11, alignItems: startItems}}>
            {titleText(PANEL_TEXT, startAlign)}
            <View style={{flex: 1}} />
            {authorText(startAlign)}
          </View>
        </View>
      );
    case 'type':
    default:
      return (
        <View style={{flex: 1, alignItems: startItems, paddingTop: w * 0.11, paddingHorizontal: w * 0.1, paddingBottom: w * 0.11}}>
          {titleText(textColor, startAlign)}
          <View style={{flex: 1}} />
          {authorText(startAlign)}
        </View>
      );
  }
};
