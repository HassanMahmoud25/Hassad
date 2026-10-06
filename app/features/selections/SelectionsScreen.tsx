import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter, ribbons} from '../../theme/tokens';
import {useT} from '../../lib/i18n';
import {getFavoriteBenefits} from '../../apis/favorites.api';
import {toApiError} from '../../apis/errors';
import {queryKeys} from '../../queries/queryKeys';
import {IconButton, NoteRow, Ribbon, Skeleton, StateBlock, Text} from '../../ui';
import {Screen} from '../../ui/Screen';
import {useBookcase} from '../library/useBookcase';

const NEWEST = {sortBy: 'date', sortDirection: 'desc'} as const;

/**
 * «مختاراتي» — the notes the reader marked with the star. First version
 * (Phase B, so the tab is never a placeholder); Phase C adds the book
 * filter, sorting and scoped search.
 */
export const SelectionsScreen = () => {
  const {colors} = useTheme();
  const {t, count, num} = useT();
  const navigation = useNavigation();
  const bookcase = useBookcase();
  const q = useQuery({queryKey: queryKeys.favorites.list(NEWEST), queryFn: () => getFavoriteBenefits(NEWEST)});
  const byId = useMemo(() => new Map(bookcase.all.map(b => [b._id, b])), [bookcase.all]);
  const items = q.data ?? [];
  const books = new Set(items.map(n => n.book)).size;

  const header = (
    <View style={{paddingHorizontal: gutter}}>
      <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 8}}>
        <Text role="display1" accessibilityRole="header" style={{flex: 1}}>
          {t('selections.title')}
        </Text>
        {items.length > 0 && <IconButton icon="search" label={t('search.placeholderSelections')} onPress={() => navigation.navigate('search', {selections: true})} style={{marginTop: 4}} />}
      </View>
      {items.length > 0 && (
        <Text role="meta" tone="ink3" style={{marginTop: 2}}>
          {t('selections.countLine', {notes: count('notes', items.length), books: count('booksGen', books)})}
        </Text>
      )}
    </View>
  );

  let body: React.ReactNode;
  if (q.isPending) {
    body = (
      <View style={{paddingHorizontal: gutter, marginTop: 18, gap: 26}}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={{flexDirection: 'row', gap: 12}}>
            <View style={{width: 46, alignItems: 'center', gap: 6}}>
              <Skeleton width={14} height={8} />
              <Skeleton width={26} height={18} />
            </View>
            <View style={{flex: 1, gap: 9}}>
              <Skeleton width="58%" height={14} />
              <Skeleton width="90%" height={10} />
              <Skeleton width="40%" height={10} />
            </View>
          </View>
        ))}
      </View>
    );
  } else if (q.error) {
    const offline = toApiError(q.error).kind === 'network';
    body = <StateBlock icon={offline ? 'offline' : 'info'} title={offline ? t('library.offlineTitle') : t('selections.errorTitle')} body={t('harvest.errorBody')} actionLabel={t('common.retry')} onAction={() => q.refetch()} />;
  } else if (items.length === 0) {
    // A blank page with one gold ribbon, waiting for its first mark.
    body = (
      <View style={{alignItems: 'center', paddingHorizontal: 40, marginTop: 64}}>
        <View style={{width: 120, height: 150, borderRadius: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.rule2, alignItems: 'flex-end', paddingEnd: 22, boxShadow: '0px 14px 26px -18px rgba(58,40,14,0.35)'}}>
          <Ribbon color={ribbons['#F7F7D3'].ribbon} width={14} height={34} />
        </View>
        <Text role="display3" align="center" style={{marginTop: 26}}>
          {t('selections.emptyTitle')}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 6}}>
          {t('selections.emptyBody')}
        </Text>
      </View>
    );
  } else {
    body = (
      <View style={{paddingHorizontal: gutter, marginTop: 10}}>
        {items.map((note, i) => {
          const book = byId.get(note.book);
          return (
            <NoteRow
              key={note._id}
              first={i === 0}
              title={note.name}
              excerpt={note.content}
              page={num(note.page_number)}
              pageMark={t('book.pageMark')}
              color={note.color}
              source={book ? {title: book.name, author: book.author, imageUrl: book.img_url} : undefined}
              onPress={() => navigation.navigate('note', {bookId: note.book, noteId: note._id, note})}
              accessibilityHint={t('book.openNoteHint')}
            />
          );
        })}
      </View>
    );
  }

  return (
    <Screen tab refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      {header}
      {body}
    </Screen>
  );
};
