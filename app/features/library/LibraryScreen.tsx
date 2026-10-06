import React, {useState} from 'react';
import {useWindowDimensions, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {gutter} from '../../theme/tokens';
import {useT} from '../../lib/i18n';
import {Book} from '../../apis/types';
import {Button, IconButton, MenuRow, Plank, Segmented, Sheet, ShelfRow, ShelfRowSkeleton, Slot, StateBlock, Text} from '../../ui';
import {Screen} from '../../ui/Screen';
import {useBookcase} from './useBookcase';
import {BookTile} from './BookTile';
import {ShelfFormSheet} from './ShelfFormSheet';

type View_ = 'shelves' | 'all';

const toShelfBook = (b: Book) => ({id: b._id, title: b.name, author: b.author, imageUrl: b.img_url});

/**
 * «المكتبة»: a bookcase. One row per shelf, then the books on no shelf —
 * the only books `GET /api/books` returns (Design Lock v2 §05).
 */
export const LibraryScreen = () => {
  const {t, count} = useT();
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const bookcase = useBookcase();
  const [view, setView] = useState<View_>('shelves');
  const [addOpen, setAddOpen] = useState(false);
  const [shelfFormOpen, setShelfFormOpen] = useState(false);

  const openBook = (book: Book) => navigation.navigate('book', {book});
  const addBook = (folderId?: string) => navigation.navigate('bookForm', {folderId: folderId ?? null});
  const isEmpty = !bookcase.loading && !bookcase.error && bookcase.totals.books === 0 && bookcase.shelves.length === 0;

  const header = (
    <View style={{paddingHorizontal: gutter}}>
      <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 8}}>
        <View style={{flex: 1}}>
          <Text role="display1" accessibilityRole="header">
            {t('library.title')}
          </Text>
          {!bookcase.loading && !isEmpty && !bookcase.error ? (
            <Text role="meta" tone="ink3" style={{marginTop: 2}}>
              {[count('books', bookcase.totals.books), bookcase.totals.shelves ? count('shelves', bookcase.totals.shelves) : null, count('notes', bookcase.totals.notes)].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
        {!isEmpty && <IconButton icon="search" label={t('library.searchLabel')} onPress={() => navigation.navigate('search')} style={{marginTop: 4}} />}
        <IconButton icon="plus" label={t('library.addLabel')} onPress={() => setAddOpen(true)} style={{marginTop: 4}} />
      </View>
      {!isEmpty && !bookcase.error && (
        <Segmented
          style={{marginTop: 14}}
          height={38}
          value={view}
          onChange={setView}
          options={[
            {value: 'shelves', label: t('library.viewShelves')},
            {value: 'all', label: t('library.viewAll')},
          ]}
        />
      )}
    </View>
  );

  let body: React.ReactNode;
  if (bookcase.loading) {
    body = (
      <View style={{marginTop: 20, gap: 22}}>
        <ShelfRowSkeleton />
        <ShelfRowSkeleton />
        <ShelfRowSkeleton count={3} />
      </View>
    );
  } else if (bookcase.error) {
    const offline = bookcase.error.kind === 'network';
    body = <StateBlock icon={offline ? 'offline' : 'info'} title={offline ? t('library.offlineTitle') : t('library.errorTitle')} body={offline ? t('library.offlineBody') : t('library.errorBody')} actionLabel={t('common.retry')} onAction={bookcase.refresh} />;
  } else if (isEmpty) {
    body = <EmptyLibrary onAddBook={() => addBook()} onAddShelf={() => setShelfFormOpen(true)} />;
  } else if (view === 'all') {
    const gap = 14;
    const tile = Math.floor((width - gutter * 2 - gap * 2) / 3);
    body = (
      <View style={{flexDirection: 'row', flexWrap: 'wrap', columnGap: gap, rowGap: 26, paddingHorizontal: gutter, marginTop: 22}}>
        {bookcase.all.map(b => (
          <BookTile key={b._id} book={b} width={tile} onPress={() => openBook(b)} />
        ))}
      </View>
    );
  } else {
    const hasShelves = bookcase.shelves.length > 0;
    body = (
      <View style={{marginTop: 20, gap: 22}}>
        {bookcase.shelves.map(s => (
          <ShelfRow
            key={s.folder._id}
            title={s.folder.name}
            countLabel={s.loading ? undefined : count('books', s.books.length)}
            books={s.books.map(toShelfBook)}
            onPressHeader={() => navigation.navigate('shelf', {folderId: s.folder._id})}
            onPressBook={b => openBook(s.books.find(x => x._id === b.id)!)}
            onAddBook={s.books.length === 0 && !s.loading && !s.error ? () => addBook(s.folder._id) : undefined}
            addLabel={t('library.addBook')}
            emptyLabel={s.error ? t('library.shelfError') : s.loading ? undefined : t('library.emptyShelf')}
          />
        ))}
        {bookcase.loose.length > 0 && (
          <ShelfRow
            title={hasShelves ? t('library.unshelved') : t('library.yourBooks')}
            countLabel={count('books', bookcase.loose.length)}
            books={bookcase.loose.map(toShelfBook)}
            onPressHeader={() => setView('all')}
            onPressBook={b => openBook(bookcase.loose.find(x => x._id === b.id)!)}
          />
        )}
      </View>
    );
  }

  return (
    <Screen tab refreshing={bookcase.refreshing} onRefresh={bookcase.loading ? undefined : bookcase.refresh}>
      {header}
      {body}
      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} accessibilityLabel={t('library.addLabel')}>
        <MenuRow first icon="read" label={t('library.addBook')} onPress={() => { setAddOpen(false); addBook(); }} />
        <MenuRow icon="shelf" label={t('library.addShelf')} onPress={() => { setAddOpen(false); setShelfFormOpen(true); }} />
      </Sheet>
      <ShelfFormSheet visible={shelfFormOpen} onClose={() => setShelfFormOpen(false)} />
    </Screen>
  );
};

/** An empty bookcase: the first plank already has a place for a book. */
const EmptyLibrary = ({onAddBook, onAddShelf}: {onAddBook: () => void; onAddShelf: () => void}) => {
  const {t} = useT();
  return (
    <View style={{marginTop: 34}}>
      <View style={{flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: gutter, height: 130, overflow: 'hidden'}}>
        <View>
          <Slot width={82} height={123} />
          <View style={{position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center'}}>
            <IconButton icon="plus" label={t('library.addBook')} variant="ink" small onPress={onAddBook} />
          </View>
        </View>
        <Slot width={78} height={117} style={{opacity: 0.55}} />
        <Slot width={80} height={120} style={{opacity: 0.35}} />
        <Slot width={76} height={114} style={{opacity: 0.2}} />
      </View>
      <Plank />
      <View style={{height: 54}} />
      <Plank style={{opacity: 0.55}} />
      <View style={{alignItems: 'center', paddingHorizontal: 36, marginTop: 40}}>
        <Text role="display2" align="center">
          {t('library.emptyTitle')}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 8}}>
          {t('library.emptyBody')}
        </Text>
        <Button label={t('library.emptyCta')} icon="plus" onPress={onAddBook} style={{marginTop: 22, minWidth: 210, alignSelf: 'center'}} />
        <Button label={t('library.emptyShelfFirst')} variant="line" onPress={onAddShelf} style={{marginTop: 4, alignSelf: 'center', borderWidth: 0, height: 44}} />
      </View>
    </View>
  );
};
