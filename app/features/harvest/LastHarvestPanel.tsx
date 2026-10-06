import React from 'react';
import {I18nManager, Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';
import Svg, {Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop} from 'react-native-svg';
import {useTheme} from '../../theme/ThemeProvider';
import {bookTint, gutter} from '../../theme/tokens';
import {Book} from '../../apis/types';
import {Button, Cover, Text} from '../../ui';
import {coverSeed, coverTitle, designFor} from '../../ui/book/coverDesign';
import {bindLatinRuns} from '../../lib/text';

const PHOTO_CLOTH = '#7A6A55';
const HEIGHT = 214;
const COVER_W = 100;

interface Props {
  book: Book;
  eyebrow: string;
  /** "آخر فائدة في ص 142 · قبل يومين" or "لم تحصد منه بعد". */
  detail: string;
  actionLabel: string;
  onOpen: () => void;
  onHarvest: () => void;
  openHint: string;
}

/**
 * «آخر ما حصدت منه»: the one lit panel on Home. The book's own binding
 * tints it, the cover leans in at the start edge, and the bottom dissolves
 * into the paper so it reads as light, not a box.
 */
export const LastHarvestPanel = ({book, eyebrow, detail, actionLabel, onOpen, onHarvest, openHint}: Props) => {
  const {name, colors} = useTheme();
  const {width} = useWindowDimensions();
  const w = width - gutter * 2;
  const cloth = book.img_url ? PHOTO_CLOTH : designFor(coverSeed(book.name)).binding.cloth;
  const t = bookTint(cloth, name);
  return (
    <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${eyebrow}: ${book.name}. ${detail}`} accessibilityHint={openHint} style={({pressed}) => ({opacity: pressed ? 0.92 : 1})}>
      <View style={{height: HEIGHT, borderRadius: 30, overflow: 'hidden'}}>
        <Svg width={w} height={HEIGHT} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={t.top} />
              <Stop offset="0.6" stopColor={t.mid} />
              <Stop offset="1" stopColor={colors.paper} />
            </LinearGradient>
            <RadialGradient id="panelGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={t.glow} stopOpacity={1} />
              <Stop offset="0.7" stopColor={t.glow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={w} height={HEIGHT} fill="url(#panel)" />
          {/* On Paper a cloth-coloured glow reads as a smudge around dark
              bindings; the hero shadow carries the depth there. */}
          {name === 'dark' && <Ellipse cx={w * (I18nManager.isRTL ? 0.78 : 0.22)} cy={HEIGHT * 0.42} rx={160} ry={140} fill="url(#panelGlow)" />}
        </Svg>
        <View style={{flex: 1, flexDirection: 'row', padding: 22, gap: 18}}>
          <View style={{transform: [{rotate: '-3deg'}], marginTop: -2}}>
            <Cover title={book.name} author={book.author} imageUrl={book.img_url} width={COVER_W} shadow="hero" decorative />
          </View>
          <View style={{flex: 1, paddingTop: 2}}>
            <Text role="label" tone="gold" style={{fontFamily: 'IBMPlexSansArabic-SemiBold'}}>
              {eyebrow}
            </Text>
            {/* The main title only: the subtitle lives on the Book screen. */}
            <Text role="display3" numberOfLines={2} style={{marginTop: 4}}>
              {bindLatinRuns(coverTitle(book.name))}
            </Text>
            <Text role="meta" tone="ink2" numberOfLines={2} style={{marginTop: 4}}>
              {detail}
            </Text>
            <View style={{flex: 1}} />
            <Button label={actionLabel} icon="plus" size="sm" onPress={onHarvest} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

/** Placeholder in the panel's final shape. */
export const LastHarvestSkeleton = () => {
  const {colors} = useTheme();
  return <View style={{height: HEIGHT, borderRadius: 30, backgroundColor: colors.skeleton, opacity: 0.7}} />;
};
