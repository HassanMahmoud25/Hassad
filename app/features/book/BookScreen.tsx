import React, {useMemo, useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter} from '../../theme/tokens';
import {useT} from '../../lib/i18n';
import {bindLatinRuns, isolate} from '../../lib/text';
import {deleteBook} from '../../apis/books.api';
import {toApiError} from '../../apis/errors';
import {Benefit} from '../../apis/types';
import {queryKeys} from '../../queries/queryKeys';
import {RootStackParamList} from '../../navigation/types';
import {barBottom} from '../../navigation/TabBar';
import {Button, Chip, Cover, Dialog, Glass, IconButton, MenuRow, NoteRow, Ribbon, Sheet, Skeleton, Text} from '../../ui';
import {coverSeed, designFor} from '../../ui/book/coverDesign';
import {useBookcase} from '../library/useBookcase';
import {BookTint} from './BookTint';
import {FactsStrip} from './FactsStrip';
import {useBookNotes} from './useBookNotes';
import {shareNotesAsText} from './exportNotes';

type Props = NativeStackScreenProps<RootStackParamList, 'book'>;

const PHOTO_CLOTH = '#7A6A55';

/**
 * The Book: its binding lights the top of the screen, the cover stands in
 * the light, and the notes sit on a page below (Design Lock v2 §06).
 */
export const BookScreen = ({route, navigation}: Props) => {
  const {colors, isDark} = useTheme();
  const {t, count, num} = useT();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const bookcase = useBookcase();
  const book = bookcase.all.find(b => b._id === route.params.book._id) ?? route.params.book;
  const shelf = book.folder ? bookcase.shelves.find(s => s.folder._id === book.folder)?.folder : undefined;
  const notes = useBookNotes(book._id);
  const [sort, setSort] = useState<'pages' | 'newest'>('pages');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const list = useMemo<Benefit[]>(() => {
    const data = notes.data ?? [];
    return sort === 'pages' ? [...data].sort((a, b) => a.page_number - b.page_number || a.createdAt.localeCompare(b.createdAt)) : data;
  }, [notes.data, sort]);
  const noteCount = notes.data?.length ?? book.num_of_benefits ?? 0;
  const selected = (notes.data ?? []).filter(n => n.favourated).length;
  const lastPage = (notes.data ?? []).reduce((m, n) => Math.max(m, n.page_number || 0), 0);

  const cloth = book.img_url ? PHOTO_CLOTH : designFor(coverSeed(book.name)).binding.cloth;
  const captureBottom = barBottom(insets.bottom);

  const remove = useMutation({
    mutationFn: () => deleteBook(book._id, book.folder),
    onSuccess: () => {
      setConfirmDelete(false);
      queryClient.invalidateQueries({queryKey: queryKeys.books.all});
      queryClient.invalidateQueries({queryKey: queryKeys.folders.all});
      queryClient.invalidateQueries({queryKey: queryKeys.favorites.all});
      queryClient.removeQueries({queryKey: ['benefits', 'book', book._id]});
      navigation.goBack();
    },
  });

  const exportText = () => shareNotesAsText(book, notes.data ?? [], t('book.pageMark')).catch(() => {});
  const openNote = (benefit: Benefit) => navigation.navigate('note', {bookId: book._id, noteId: benefit._id, note: benefit});
  const capture = () => navigation.navigate('editor', {bookId: book._id});

  return (
    <View style={{flex: 1, backgroundColor: colors.paper}}>
      <Animated.ScrollView
        contentContainerStyle={{paddingTop: insets.top + 46, minHeight: '100%'}}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true})}>
        <BookTint cloth={cloth} />
        <View style={{alignItems: 'center', paddingHorizontal: 32}}>
          <Cover seed={book._id} title={book.name} author={book.author} imageUrl={book.img_url} width={138} shadow="hero" />
          <Text role="display2" align="center" accessibilityRole="header" style={{marginTop: 18}}>
            {bindLatinRuns(book.name)}
          </Text>
          {book.author ? (
            <Text role="small" tone="ink2" align="center" style={{marginTop: 1}}>
              {book.author}
            </Text>
          ) : null}
          {shelf && (
            <Chip
              small
              icon="shelf"
              label={shelf.name}
              onPress={() => navigation.navigate('shelf', {folderId: shelf._id})}
              style={{marginTop: 10, alignSelf: 'center', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.rule2}}
            />
          )}
        </View>

        {/* The page, with two sheets under it for depth. */}
        <View style={{marginTop: 26, flexGrow: 1}}>
          <View style={{position: 'absolute', top: -11, start: 22, end: 22, height: 12, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: colors.paper3, opacity: 0.85}} />
          <View style={{position: 'absolute', top: -6, start: 10, end: 10, height: 12, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: colors.paper2}} />
          <View style={{flexGrow: 1, backgroundColor: isDark ? colors.paper : colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: gutter, paddingTop: 16, paddingBottom: captureBottom + 64 + 28}}>
            {noteCount > 0 || notes.isPending ? (
              <>
                <FactsStrip
                  facts={[
                    {value: notes.isPending ? '—' : num(noteCount), label: noteCount === 1 ? t('book.factNotesOne') : t('book.factNotes')},
                    {value: notes.isPending ? '—' : num(selected), label: t('book.factSelected'), gold: selected > 0},
                    {value: lastPage ? num(lastPage) : '—', label: t('book.factLastPage')},
                  ]}
                />
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 14}}>
                  <Text role="display3" style={{flex: 1, fontSize: 21, lineHeight: 28}}>
                    {t('book.notesHeading')}
                  </Text>
                  <Chip small line icon="sort" label={sort === 'pages' ? t('book.sortPages') : t('book.sortNewest')} onPress={() => setSort(s => (s === 'pages' ? 'newest' : 'pages'))} style={{height: 30, borderRadius: 15}} />
                </View>
              </>
            ) : null}

            {notes.isPending ? (
              <NotesSkeleton />
            ) : notes.apiError ? (
              <View style={{paddingVertical: 28, alignItems: 'center', gap: 12}}>
                <Text role="body" tone="ink2" align="center">
                  {t('book.loadError')}
                </Text>
                <Button label={t('common.retry')} icon="retry" variant="line" size="sm" onPress={() => notes.refetch()} />
              </View>
            ) : list.length === 0 ? (
              <EmptyPage title={t('book.emptyTitle')} body={t('book.emptyBody')} pageMark={t('book.pageMark')} />
            ) : (
              <View style={{marginTop: 2}}>
                {list.map((n, i) => (
                  <NoteRow
                    key={n._id}
                    first={i === 0}
                    title={n.name}
                    excerpt={n.content}
                    page={num(n.page_number)}
                    pageMark={t('book.pageMark')}
                    color={n.color}
                    favourite={n.favourated}
                    onPress={() => openNote(n)}
                    accessibilityHint={t('book.openNoteHint')}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Once the title scrolls away, a glass bar carries it. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          start: 0,
          end: 0,
          height: insets.top + 60,
          opacity: scrollY.interpolate({inputRange: [40, 140], outputRange: [0, 1], extrapolate: 'clamp'}),
        }}>
        <View style={[StyleSheet.absoluteFill, {backgroundColor: colors.glassStrong, borderBottomWidth: 1, borderBottomColor: colors.rule2}]} />
        <Animated.View style={{position: 'absolute', top: insets.top, bottom: 0, start: 72, end: 120, justifyContent: 'center', opacity: scrollY.interpolate({inputRange: [250, 310], outputRange: [0, 1], extrapolate: 'clamp'})}}>
          <Text role="label" align="center" numberOfLines={1} style={{fontFamily: 'IBMPlexSansArabic-SemiBold'}}>
            {book.name}
          </Text>
        </Animated.View>
      </Animated.View>

      <View style={{position: 'absolute', top: insets.top + 6, start: 14, end: 14, flexDirection: 'row', gap: 10}}>
        <IconButton icon="back" label={t('common.back')} variant="glass" onPress={() => navigation.goBack()} />
        <View style={{flex: 1}} />
        {noteCount > 0 && <IconButton icon="search" label={t('book.searchInBook')} variant="glass" onPress={() => navigation.navigate('search', {bookId: book._id})} />}
        <IconButton icon="more" label={t('book.actionsLabel')} variant="glass" onPress={() => setActionsOpen(true)} />
      </View>

      <View style={{position: 'absolute', bottom: captureBottom, start: 22, end: 22}}>
        <Glass radius={32} style={{height: 64, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Button label={t('book.capture')} icon="plus" onPress={capture} style={{flex: 1, height: 52, alignSelf: 'auto'}} />
        </Glass>
      </View>

      <Sheet visible={actionsOpen} onClose={() => setActionsOpen(false)} accessibilityLabel={t('book.actionsLabel')}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.rule2}}>
          <Cover seed={book._id} title={book.name} imageUrl={book.img_url} width={40} shadow="shelf" />
          <View style={{flex: 1}}>
            <Text role="title" numberOfLines={2}>
              {book.name}
            </Text>
            <Text role="meta" tone="ink3">
              {/* A zero isn't news: show selections only when there are some. */}
              {selected > 0 ? t('book.summary', {notes: count('notes', noteCount), selected: num(selected)}) : count('notes', noteCount)}
            </Text>
          </View>
        </View>
        <View style={{marginTop: 4}}>
          <MenuRow first icon="edit" label={t('book.editDetails')} onPress={() => { setActionsOpen(false); navigation.navigate('bookForm', {book}); }} />
          <MenuRow icon="image" label={t('book.changeCover')} onPress={() => { setActionsOpen(false); navigation.navigate('bookForm', {book}); }} />
          {noteCount > 0 && <MenuRow icon="share" label={t('book.exportText')} onPress={() => { setActionsOpen(false); exportText(); }} />}
          <MenuRow icon="trash" danger label={t('book.deleteBook')} onPress={() => { setActionsOpen(false); setConfirmDelete(true); }} />
        </View>
      </Sheet>

      <Dialog visible={confirmDelete} onClose={() => !remove.isPending && setConfirmDelete(false)}>
        <View style={{alignItems: 'center'}}>
          <View style={{transform: [{rotate: '-4deg'}], opacity: 0.85}}>
            <Cover seed={book._id} title={book.name} imageUrl={book.img_url} width={56} shadow="shelf" />
          </View>
          <Text role="display3" align="center" style={{marginTop: 18}}>
            {t('book.deleteTitle', {title: isolate(book.name)})}
          </Text>
          <Text role="body" tone="ink2" align="center" style={{marginTop: 8}}>
            {noteCount === 0
              ? t('book.deleteBodyEmpty')
              : selected > 0
              ? t('book.deleteBodyNotesFav', {notes: count('notes', noteCount), selected: num(selected)})
              : t('book.deleteBodyNotes', {notes: count('notes', noteCount)})}
          </Text>
        </View>
        {noteCount > 0 && (
          <Button label={t('book.exportFirst')} icon="share" variant="soft" block onPress={exportText} style={{marginTop: 16, borderRadius: 16, justifyContent: 'flex-start'}} />
        )}
        {remove.isError && (
          <Text role="small" tone="danger" align="center" style={{marginTop: 12}}>
            {toApiError(remove.error).kind === 'network' ? t('common.offline') : t('book.deleteError')}
          </Text>
        )}
        <View style={{gap: 8, marginTop: 18}}>
          <Button label={noteCount > 0 ? t('book.deleteConfirmNotes') : t('book.deleteConfirm')} variant="danger" block loading={remove.isPending} onPress={() => remove.mutate()} />
          <Button label={t('common.cancel')} variant="line" block disabled={remove.isPending} onPress={() => setConfirmDelete(false)} style={{borderWidth: 0}} />
        </View>
      </Dialog>
    </View>
  );
};

const NotesSkeleton = () => (
  <View style={{marginTop: 8}}>
    {[0, 1, 2].map(i => (
      <View key={i} style={{flexDirection: 'row', gap: 12, paddingVertical: 18}}>
        <View style={{width: 46, alignItems: 'center', gap: 6}}>
          <Skeleton width={14} height={8} />
          <Skeleton width={26} height={18} />
        </View>
        <View style={{flex: 1, gap: 9, paddingTop: 4}}>
          <Skeleton width="62%" height={14} />
          <Skeleton width="92%" height={10} />
          <Skeleton width="70%" height={10} />
        </View>
      </View>
    ))}
  </View>
);

/** The empty page teaches the format: a margin waiting for its first page. */
const EmptyPage = ({title, body, pageMark}: {title: string; body: string; pageMark: string}) => {
  const {colors} = useTheme();
  return (
    <View style={{paddingTop: 6}}>
      <View style={{flexDirection: 'row', gap: 12, paddingVertical: 18, opacity: 0.55}} importantForAccessibility="no-hide-descendants">
        <View style={{width: 46, alignItems: 'center', paddingTop: 3}}>
          <Text role="meta" tone="ink3" style={{fontSize: 10, lineHeight: 12, marginBottom: 5}}>
            {pageMark}
          </Text>
          <Text role="numeral" tone="ink4" style={{lineHeight: 22}}>
            —
          </Text>
          <View style={{marginTop: 9}}>
            <Ribbon color={colors.rule} />
          </View>
        </View>
        <View style={{flex: 1, gap: 9, paddingTop: 4}}>
          <View style={{height: 12, width: '62%', borderRadius: 6, backgroundColor: colors.paper3}} />
          <View style={{height: 8, width: '92%', borderRadius: 4, backgroundColor: colors.paper2}} />
          <View style={{height: 8, width: '70%', borderRadius: 4, backgroundColor: colors.paper2}} />
        </View>
      </View>
      <View style={{alignItems: 'center', paddingTop: 18, paddingHorizontal: 16}}>
        <Text role="display3" align="center">
          {title}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 6}}>
          {body}
        </Text>
      </View>
    </View>
  );
};
