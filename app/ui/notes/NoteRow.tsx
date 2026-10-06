import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {ribbonFor} from '../../theme/tokens';
import {Text} from '../Text';
import {Ribbon} from '../Ribbon';
import {Icon} from '../Icon';
import {Cover} from '../book/Cover';
import {coverTitle} from '../book/coverDesign';

interface NoteRowProps {
  title: string;
  excerpt?: string;
  /** Already formatted in the reader's numerals. */
  page: string;
  /** «ص» in Arabic, "p." in English. */
  pageMark: string;
  color?: string;
  favourite?: boolean;
  first?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
  /** The book it came from, for rows shown outside their Book. */
  source?: {title: string; author?: string; imageUrl?: string | null};
}

/**
 * Marginalia: the page number lives in the margin, in gold ink, with the
 * note's ribbon under it (Design Lock v2 §08). Title and excerpt are set in
 * the reading face of their own script.
 */
export const NoteRow = ({title, excerpt, page, pageMark, color, favourite, first, onPress, accessibilityHint, source}: NoteRowProps) => {
  const {colors} = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, source?.title, `${pageMark} ${page}`].filter(Boolean).join('، ')}
      accessibilityHint={accessibilityHint}
      style={({pressed}) => ({
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 18,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: colors.rule2,
        opacity: pressed ? 0.6 : 1,
      })}>
      <View style={{width: 46, alignItems: 'center', paddingTop: 3}}>
        <Text role="meta" tone="ink3" align="center" style={{fontSize: 10, lineHeight: 12, marginBottom: 5}}>
          {pageMark}
        </Text>
        <Text role="numeral" tone="gold" align="center" style={{lineHeight: 22}} numberOfLines={1} adjustsFontSizeToFit>
          {page}
        </Text>
        <View style={{marginTop: 9}}>
          <Ribbon color={ribbonFor(color)} />
        </View>
      </View>
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row', gap: 8, alignItems: 'flex-start'}}>
          <Text role="title" align="natural" style={{flex: 1}} numberOfLines={3}>
            {title}
          </Text>
          {favourite && <Icon name="star" size={16} color={colors.gold} filled style={{marginTop: 5}} />}
        </View>
        {excerpt ? (
          <Text role="excerpt" tone="ink2" align="natural" numberOfLines={source ? 1 : 2} style={{marginTop: 3}}>
            {excerpt}
          </Text>
        ) : null}
        {source ? (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8}}>
            <Cover title={source.title} author={source.author} imageUrl={source.imageUrl} width={16} shadow="none" decorative />
            <Text role="meta" tone="ink3" numberOfLines={1} style={{flexShrink: 1}}>
              {coverTitle(source.title)}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};
