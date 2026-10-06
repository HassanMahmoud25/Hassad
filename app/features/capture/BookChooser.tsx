import React, {useMemo, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/type';
import {useT} from '../../lib/i18n';
import {foldArabic} from '../../lib/text';
import {Book} from '../../apis/types';
import {Cover, Icon, Slot, Text} from '../../ui';
import {coverTitle} from '../../ui/book/coverDesign';

interface Props {
  books: Book[];
  selectedId?: string;
  onSelect: (book: Book) => void;
  onNewBook: () => void;
  /** Rows shown before the filter is used. */
  limit?: number;
}

const byActivity = (a: Book, b: Book) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt);

/** Pick a book to harvest from: most recently active first, filterable. */
export const BookChooser = ({books, selectedId, onSelect, onNewBook, limit = 4}: Props) => {
  const {colors} = useTheme();
  const {t, count} = useT();
  const [query, setQuery] = useState('');
  const q = foldArabic(query.trim());
  const rows = useMemo(() => {
    const sorted = [...books].sort(byActivity);
    if (!q) {
      // Keep the selected book visible even when it isn't among the newest.
      const top = sorted.slice(0, limit);
      const sel = sorted.find(b => b._id === selectedId);
      return sel && !top.includes(sel) ? [sel, ...top.slice(0, limit - 1)] : top;
    }
    return sorted.filter(b => foldArabic(b.name).includes(q) || foldArabic(b.author ?? '').includes(q)).slice(0, 8);
  }, [books, q, limit, selectedId]);

  return (
    <View>
      {books.length > limit && (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.rule, backgroundColor: colors.card, paddingHorizontal: 14, marginBottom: 6}}>
          <Icon name="search" size={18} color={colors.ink3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('capture.filter')}
            placeholderTextColor={colors.ink4}
            accessibilityLabel={t('capture.filter')}
            style={{flex: 1, fontFamily: fonts.plex[400], fontSize: 15, color: colors.ink, padding: 0}}
          />
        </View>
      )}
      <View accessibilityRole="radiogroup">
        {rows.map((b, i) => {
          const on = b._id === selectedId;
          return (
            <Pressable
              key={b._id}
              onPress={() => onSelect(b)}
              accessibilityRole="radio"
              accessibilityState={{checked: on}}
              accessibilityLabel={b.name}
              style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.rule2, opacity: pressed ? 0.6 : 1})}>
              <Cover title={b.name} author={b.author} imageUrl={b.img_url} width={36} shadow="shelf" decorative />
              <View style={{flex: 1}}>
                <Text role="title" numberOfLines={1} style={{fontSize: 18, lineHeight: 24}}>
                  {coverTitle(b.name)}
                </Text>
                <Text role="meta" tone="ink3">
                  {b.num_of_benefits ? count('notes', b.num_of_benefits) : t('capture.noNotesYet')}
                </Text>
              </View>
              <View style={{width: 26, height: 26, borderRadius: 13, borderWidth: on ? 0 : 1.5, borderColor: colors.rule, backgroundColor: on ? colors.ink : 'transparent', alignItems: 'center', justifyContent: 'center'}}>
                {on && <Icon name="check" size={15} color={colors.onInk} strokeWidth={2} />}
              </View>
            </Pressable>
          );
        })}
        {q && rows.length === 0 ? (
          <Text role="small" tone="ink3" style={{paddingVertical: 14}}>
            {t('capture.noMatch')}
          </Text>
        ) : null}
        <Pressable onPress={onNewBook} accessibilityRole="button" style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.rule2, opacity: pressed ? 0.6 : 1})}>
          <View>
            <Slot width={36} height={54} />
            <View style={{position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center'}}>
              <Icon name="plus" size={16} color={colors.ink2} />
            </View>
          </View>
          <Text role="label">{t('capture.newBook')}</Text>
        </Pressable>
      </View>
    </View>
  );
};
