import React, {useMemo} from 'react';
import {Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter} from '../../theme/tokens';
import {useAuth} from '../../contexts/AuthContext';
import {useT} from '../../lib/i18n';
import {currentLang} from '../../lib/locale';
import {greeting, hijriDate, longDate, relativeDay} from '../../lib/time';
import {isolate} from '../../lib/text';
import {coverTitle} from '../../ui/book/coverDesign';
import {Benefit, Book} from '../../apis/types';
import {Button, Icon, IconButton, NoteRow, Plank, QuoteBlock, Seal, SectionHead, ShelfRow, Skeleton, Slot, StateBlock, Text} from '../../ui';
import {Screen} from '../../ui/Screen';
import {LastHarvestPanel, LastHarvestSkeleton} from './LastHarvestPanel';
import {selectionOfTheDay, useHarvest} from './useHarvest';

/**
 * «حصادي» — the reader's home. Order is the product hierarchy (approved in
 * Phase A): where I am → what I harvested lately → what I chose to keep →
 * the books themselves. Every section is backed by real data or omitted.
 */
export const HarvestScreen = () => {
  const {colors, prefs} = useTheme();
  const {t, num} = useT();
  const {user} = useAuth();
  const navigation = useNavigation();
  const harvest = useHarvest();
  const lang = currentLang();

  const name = user?.first_name?.trim();
  const dateLine = [longDate(lang, prefs.numerals), hijriDate(lang, prefs.numerals)].filter(Boolean).join(' · ');
  const title = name ? `${greeting(lang)}${lang === 'ar' ? '،' : ','} ${name}` : greeting(lang);

  const openBook = (book: Book) => navigation.navigate('book', {book});
  const openNote = (note: Benefit) => navigation.navigate('note', {bookId: note.book, noteId: note._id, note});
  const harvestFrom = (book: Book) => navigation.navigate('editor', {bookId: book._id});

  // Today's selection, preferring one not already listed under recent notes.
  const recentIds = new Set(harvest.recent.map(r => r.note._id));
  const todays = useMemo(() => {
    const fresh = harvest.selections.filter(s => !recentIds.has(s.note._id));
    return selectionOfTheDay(fresh.length ? fresh : harvest.selections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [harvest.selections, harvest.recent]);

  const header = (
    <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: gutter}}>
      <View style={{flex: 1}}>
        <Text role="meta" tone="ink3">
          {dateLine}
        </Text>
        <Text role="display1" accessibilityRole="header" numberOfLines={2} style={{marginTop: 2}}>
          {title}
        </Text>
      </View>
      {harvest.books.length > 0 && <IconButton icon="search" label={t('harvest.search')} onPress={() => navigation.navigate('search')} style={{marginTop: 6}} />}
      <View style={{marginTop: 3}}>
        <Seal name={name || user?.email || '·'} onPress={() => navigation.navigate('me')} accessibilityLabel={t('harvest.me')} accessibilityHint={t('me.sealHint')} />
      </View>
    </View>
  );

  if (harvest.loading) {
    return (
      <Screen tab>
        {header}
        <View style={{paddingHorizontal: gutter, marginTop: 22, gap: 28}}>
          <LastHarvestSkeleton />
          <View style={{gap: 22}}>
            <Skeleton width={140} height={18} />
            {[0, 1, 2].map(i => (
              <View key={i} style={{flexDirection: 'row', gap: 12}}>
                <View style={{width: 46, alignItems: 'center', gap: 6}}>
                  <Skeleton width={14} height={8} />
                  <Skeleton width={26} height={18} />
                </View>
                <View style={{flex: 1, gap: 9}}>
                  <Skeleton width="62%" height={14} />
                  <Skeleton width="88%" height={10} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  if (harvest.error) {
    const offline = harvest.error.kind === 'network';
    return (
      <Screen tab>
        {header}
        <StateBlock icon={offline ? 'offline' : 'info'} title={offline ? t('library.offlineTitle') : t('harvest.errorTitle')} body={t('harvest.errorBody')} actionLabel={t('common.retry')} onAction={harvest.refresh} />
      </Screen>
    );
  }

  if (!harvest.lastBook) {
    return (
      <Screen tab>
        {header}
        <EmptyHarvest onAdd={() => navigation.navigate('bookForm', {folderId: null})} />
      </Screen>
    );
  }

  const last = harvest.lastBook;
  const lastNote = harvest.lastNote;
  return (
    <Screen tab refreshing={harvest.refreshing} onRefresh={harvest.refresh}>
      {header}

      {/* 1 · Where I am */}
      <View style={{paddingHorizontal: gutter, marginTop: 22}}>
        <LastHarvestPanel
          book={last}
          eyebrow={lastNote ? t('harvest.lastEyebrow') : t('harvest.startEyebrow')}
          detail={lastNote ? t('harvest.lastDetail', {page: num(lastNote.page_number), when: relativeDay(lastNote.createdAt, lang, prefs.numerals)}) : t('harvest.noNotesDetail')}
          actionLabel={lastNote ? t('harvest.harvestAction') : t('harvest.firstAction')}
          onOpen={() => openBook(last)}
          onHarvest={() => harvestFrom(last)}
          openHint={t('harvest.openBookHint')}
        />
      </View>

      {/* 2 · What I harvested lately */}
      {harvest.recent.length > 0 || harvest.recentError ? (
        <View style={{paddingHorizontal: gutter, marginTop: 34}}>
          <SectionHead title={t('harvest.recentTitle')} />
          {harvest.recentError && harvest.recent.length === 0 ? (
            <Pressable onPress={harvest.refresh} accessibilityRole="button" style={{flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14}}>
              <Icon name="retry" size={16} color={colors.ink3} />
              <Text role="small" tone="ink3">
                {t('harvest.recentError')}
              </Text>
            </Pressable>
          ) : (
            harvest.recent.map(({note, book}, i) => (
              <NoteRow
                key={note._id}
                first={i === 0}
                title={note.name}
                excerpt={note.content}
                page={num(note.page_number)}
                pageMark={t('book.pageMark')}
                color={note.color}
                favourite={note.favourated}
                source={book ? {title: book.name, author: book.author, imageUrl: book.img_url} : undefined}
                onPress={() => openNote(note)}
                accessibilityHint={t('book.openNoteHint')}
              />
            ))
          )}
        </View>
      ) : null}

      {/* 3 · What I chose to keep */}
      {todays ? (
        <View style={{paddingHorizontal: gutter, marginTop: 30}}>
          <QuoteBlock
            eyebrow={t('harvest.fromSelections')}
            source={todays.book ? t('harvest.sourcePage', {book: isolate(coverTitle(todays.book.name)), page: num(todays.note.page_number)}) : `${t('book.pageMark')} ${num(todays.note.page_number)}`}
            text={todays.note.content?.trim() || todays.note.name}
            onPress={() => openNote(todays.note)}
            footer={
              <Pressable onPress={() => navigation.navigate('tabs', {screen: 'selections'})} accessibilityRole="link" hitSlop={8} style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-end', marginTop: 12, opacity: pressed ? 0.6 : 1})}>
                <Text role="label" tone="ink2">
                  {t('harvest.selectionsLink', {count: num(harvest.selections.length)})}
                </Text>
                <Icon name="forward" size={14} color={colors.ink2} />
              </Pressable>
            }
          />
        </View>
      ) : harvest.recent.length > 0 && !harvest.selectionsLoading ? (
        <View style={{paddingHorizontal: gutter, marginTop: 26, flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: colors.rule2, paddingTop: 14}}>
          <Icon name="star" size={16} color={colors.gold} style={{marginTop: 3}} />
          <Text role="small" tone="ink3" style={{flex: 1}}>
            {t('harvest.starHint')}
          </Text>
        </View>
      ) : null}

      {/* 4 · The books themselves */}
      {harvest.shelfBooks.length > 0 && (
        <View style={{marginTop: 34}}>
          <View style={{paddingHorizontal: gutter}}>
            <SectionHead title={t('harvest.booksTitle')} more={t('harvest.libraryLink')} onMore={() => navigation.navigate('tabs', {screen: 'library'})} />
          </View>
          <ShelfRow
            title=""
            hideHeader
            books={harvest.shelfBooks.map(b => ({id: b._id, title: b.name, author: b.author, imageUrl: b.img_url}))}
            onPressBook={b => openBook(harvest.shelfBooks.find(x => x._id === b.id)!)}
          />
        </View>
      )}
    </Screen>
  );
};

/** No books yet: the bookcase is waiting, with one place for the first book. */
export const EmptyHarvest = ({onAdd}: {onAdd: () => void}) => {
  const {t} = useT();
  return (
    <View style={{marginTop: 40}}>
      <View style={{flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: gutter, height: 130}}>
        <View>
          <Slot width={82} height={123} />
          <View style={{position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center'}}>
            <IconButton icon="plus" label={t('harvest.emptyAction')} variant="ink" small onPress={onAdd} />
          </View>
        </View>
      </View>
      <Plank />
      <View style={{paddingHorizontal: 36, marginTop: 36, alignItems: 'center'}}>
        <Text role="display2" align="center">
          {t('harvest.emptyTitle')}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 8}}>
          {t('harvest.emptyBody')}
        </Text>
        <Button label={t('harvest.emptyAction')} icon="plus" onPress={onAdd} style={{marginTop: 22, alignSelf: 'center', minWidth: 190}} />
      </View>
    </View>
  );
};
