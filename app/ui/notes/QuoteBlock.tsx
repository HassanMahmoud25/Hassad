import React from 'react';
import {Pressable, Text as RNText, View} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/type';
import {detectScript} from '../../lib/text';
import {uiScript} from '../../lib/locale';
import {Text} from '../Text';
import {Icon} from '../Icon';

interface QuoteBlockProps {
  eyebrow: string;
  /** "صيد الخاطر · ص 21" */
  source: string;
  text: string;
  onPress?: () => void;
  footer?: React.ReactNode;
}

/**
 * A selection set as a quotation between hairlines (Home board,
 * «فائدة اليوم»): gold star eyebrow, source opposite, the words in the
 * reading face with guillemets in the UI face.
 */
export const QuoteBlock = ({eyebrow, source, text, onPress, footer}: QuoteBlockProps) => {
  const {colors, readingScale} = useTheme();
  const rtl = detectScript(text, uiScript()) === 'arabic';
  const size = (rtl ? 19.5 : 20) * readingScale;
  const open = rtl ? '«' : '“';
  const close = rtl ? '»' : '”';
  return (
    <View style={{borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.rule, paddingTop: 16, paddingBottom: footer ? 12 : 20}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
        <Icon name="star" size={15} color={colors.gold} filled />
        <Text role="label" tone="gold" style={{fontFamily: fonts.plex[600], flex: 1}}>
          {eyebrow}
        </Text>
        <Text role="meta" tone="ink3" numberOfLines={1} script={uiScript()} style={{flexShrink: 1}}>
          {source}
        </Text>
      </View>
      <Pressable onPress={onPress} disabled={!onPress} accessibilityRole="button" accessibilityLabel={`${text}، ${source}`} style={({pressed}) => ({opacity: pressed ? 0.7 : 1, marginTop: 12})}>
        <Text
          role="excerpt"
          align="natural"
          numberOfLines={5}
          style={{fontFamily: rtl ? fonts.thmanyah[400] : fonts.newsreader[400], fontSize: size, lineHeight: size * (rtl ? 1.75 : 1.48), color: colors.ink}}>
          {/* Bare spans: a nested Text with its own alignment would set the
              whole paragraph's alignment on Android. */}
          <RNText style={{fontFamily: fonts.plex[400], fontSize: size * 0.82, color: colors.gold}}>{open}</RNText>
          {text}
          <RNText style={{fontFamily: fonts.plex[400], fontSize: size * 0.82, color: colors.gold}}>{close}</RNText>
        </Text>
      </Pressable>
      {footer}
    </View>
  );
};
