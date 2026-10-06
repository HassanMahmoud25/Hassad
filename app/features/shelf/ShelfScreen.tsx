import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter} from '../../theme/tokens';
import {useT} from '../../lib/i18n';
import {isolate} from '../../lib/text';
import {deleteFolder} from '../../apis/folders.api';
import {toApiError} from '../../apis/errors';
import {Book} from '../../apis/types';
import {queryKeys} from '../../queries/queryKeys';
import {RootStackParamList} from '../../navigation/types';
import {Button, Cover, Dialog, Icon, IconButton, MenuRow, Plank, Screen, Sheet, Skeleton, Slot, Spine, StateBlock, Text} from '../../ui';
import {hash} from '../../ui/book/coverDesign';
import {useBookcase} from '../library/useBookcase';
import {ShelfFormSheet} from '../library/ShelfFormSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'shelf'>;

const spineSize = (id: string) => ({width: [32, 34, 36, 40, 42][hash(id, 11) % 5], height: 158 + (hash(id, 13) % 33)});

/** A shelf: its books as spines in a recessed case, then as a list. */
export const ShelfScreen = ({route, navigation}: Props) => {
  const {colors, isDark} = useTheme();
  const {t, count} = useT();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const bookcase = useBookcase();
  const shelf = bookcase.shelves.find(s => s.folder._id === route.params.folderId);
  const [sort, setSort] = useState<'newest' | 'name'>('newest');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const books = useMemo<Book[]>(() => {
    const list = shelf?.books ?? [];
    return sort === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'ar')) : list;
  }, [shelf?.books, sort]);
  const notes = books.reduce((n, b) => n + (b.num_of_benefits ?? 0), 0);

  const remove = useMutation({
    mutationFn: () => deleteFolder(route.params.folderId),
    onSuccess: () => {
      setConfirmDelete(false);
      queryClient.invalidateQueries({queryKey: queryKeys.folders.all});
      queryClient.invalidateQueries({queryKey: queryKeys.favorites.all});
      navigation.goBack();
    },
  });

  const addBook = () => navigation.navigate('bookForm', {folderId: route.params.folderId});
  const openBook = (book: Book) => navigation.navigate('book', {book});

  const topBar = (
    <View style={{flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginTop: -6}}>
      <IconButton icon="back" label={t('common.back')} onPress={() => navigation.goBack()} />
      <View style={{flex: 1}} />
      {shelf && books.length > 0 && <IconButton icon="search" label={t('shelf.searchLabel')} onPress={() => navigation.navigate('search', {folderId: shelf.folder._id})} />}
      {shelf && <IconButton icon="more" label={t('shelf.actionsLabel')} onPress={() => setActionsOpen(true)} />}
    </View>
  );

  if (!shelf) {
    return (
      <View style={{flex: 1, backgroundColor: colors.paper, paddingTop: insets.top + 12}}>
        {topBar}
        {bookcase.loading ? (
          <View style={{padding: gutter, gap: 12}}>
            <Skeleton width="50%" height={30} />
            <Skeleton width="100%" height={218} radius={26} />
          </View>
        ) : (
          <StateBlock icon="info" title={bookcase.error ? t('library.errorTitle') : t('shelf.notFound')} actionLabel={bookcase.error ? t('common.retry') : undefined} onAction={bookcase.refresh} />
        )}
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.paper}}>
      <Screen>
        {topBar}
        <View style={{paddingHorizontal: gutter, marginTop: 4}}>
          <Text role="display1" accessibilityRole="header">
            {shelf.folder.name}
          </Text>
          {!shelf.loading && (
            <Text role="meta" tone="ink3">
              {[count('books', books.length), notes ? count('notes', notes) : null].filter(Boolean).join(' · ')}
            </Text>
          )}

          {/* The shelf itself: spines in the same bindings as the covers. */}
          <View
            style={{
              marginTop: 16,
              borderRadius: 26,
              backgroundColor: colors.paper2,
              paddingTop: 22,
              overflow: 'hidden',
              boxShadow: isDark ? 'inset 0px 12px 22px -12px rgba(0,0,0,0.7)' : 'inset 0px 12px 22px -14px rgba(40,26,10,0.35)',
            }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{alignItems: 'flex-end', gap: 4, height: 196, paddingHorizontal: 18, minWidth: '100%'}}>
              {shelf.loading
                ? [0, 1, 2, 3].map(i => <Skeleton key={i} width={36} height={160 + i * 7} radius={2} />)
                : books.map(b => (
                    <Pressable key={b._id} onPress={() => openBook(b)} accessibilityRole="button" accessibilityLabel={b.name} style={({pressed}) => ({transform: [{translateY: pressed ? -6 : 0}]})}>
                      <Spine seed={b._id} hasPhoto={!!b.img_url} title={b.name} {...spineSize(b._id)} />
                    </Pressable>
                  ))}
              {!shelf.loading && books.length === 0 && <Slot width={36} height={168} onPress={addBook} accessibilityLabel={t('shelf.addBook')} />}
            </ScrollView>
            <Plank style={{marginHorizontal: 0, borderRadius: 0}} />
          </View>
        </View>

        {shelf.error ? (
          <StateBlock icon="info" title={t('shelf.loadError')} actionLabel={t('common.retry')} onAction={bookcase.refresh} />
        ) : !shelf.loading && books.length === 0 ? (
          <View style={{alignItems: 'center', paddingHorizontal: 36, marginTop: 28}}>
            <Text role="display3" align="center">
              {t('shelf.emptyTitle')}
            </Text>
            <Text role="body" tone="ink2" align="center" style={{marginTop: 6}}>
              {t('shelf.emptyBody')}
            </Text>
            <Button label={t('library.addBook')} icon="plus" onPress={addBook} style={{marginTop: 18, alignSelf: 'center'}} />
          </View>
        ) : (
          <View style={{paddingHorizontal: gutter, marginTop: 22}}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2}}>
              <Text role="title" style={{flex: 1}}>
                {t('shelf.onShelf')}
              </Text>
              <Pressable onPress={() => setSort(s => (s === 'newest' ? 'name' : 'newest'))} accessibilityRole="button" hitSlop={8} style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Text role="label" tone="ink2">
                  {sort === 'newest' ? t('shelf.sortNewest') : t('shelf.sortName')}
                </Text>
                <Icon name="chevronDown" size={14} color={colors.ink2} />
              </Pressable>
            </View>
            {books.map((b, i) => (
              <Pressable
                key={b._id}
                onPress={() => openBook(b)}
                accessibilityRole="button"
                accessibilityLabel={[b.name, b.author, b.num_of_benefits ? count('notes', b.num_of_benefits) : null].filter(Boolean).join('، ')}
                style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: i < books.length - 1 ? 1 : 0, borderBottomColor: colors.rule2, opacity: pressed ? 0.6 : 1})}>
                <Cover seed={b._id} title={b.name} author={b.author} imageUrl={b.img_url} width={48} shadow="shelf" decorative />
                <View style={{flex: 1}}>
                  <Text role="title" numberOfLines={2} style={{fontSize: 19, lineHeight: 24}}>
                    {b.name}
                  </Text>
                  {b.author ? (
                    <Text role="meta" tone="ink3" numberOfLines={1}>
                      {b.author}
                    </Text>
                  ) : null}
                  {b.num_of_benefits ? (
                    <Text role="meta" tone="gold" style={{marginTop: 2}}>
                      {count('notes', b.num_of_benefits)}
                    </Text>
                  ) : null}
                </View>
                <Icon name="forward" size={18} color={colors.ink4} />
              </Pressable>
            ))}
          </View>
        )}
      </Screen>

      <Sheet visible={actionsOpen} onClose={() => setActionsOpen(false)} accessibilityLabel={t('shelf.actionsLabel')}>
        <MenuRow first icon="edit" label={t('shelf.rename')} onPress={() => { setActionsOpen(false); setRenameOpen(true); }} />
        <MenuRow icon="plus" label={t('shelf.addBook')} onPress={() => { setActionsOpen(false); addBook(); }} />
        <MenuRow icon="trash" danger label={t('shelf.deleteShelf')} onPress={() => { setActionsOpen(false); setConfirmDelete(true); }} />
      </Sheet>
      <ShelfFormSheet visible={renameOpen} onClose={() => setRenameOpen(false)} folder={shelf.folder} />

      <Dialog visible={confirmDelete} onClose={() => !remove.isPending && setConfirmDelete(false)}>
        <Text role="display3" align="center">
          {t('shelf.deleteTitle', {name: isolate(shelf.folder.name)})}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 8}}>
          {books.length ? t('shelf.deleteBodyBooks', {books: count('books', books.length), notes: count('notes', notes)}) : t('shelf.deleteBodyEmpty')}
        </Text>
        {books.length > 0 && (
          <View style={{flexDirection: 'row', gap: 10, marginTop: 14, padding: 12, borderRadius: 16, backgroundColor: colors.paper2, alignItems: 'center'}}>
            <Icon name="info" size={18} color={colors.ink2} />
            <Text role="small" tone="ink2" style={{flex: 1}}>
              {t('shelf.deleteBackendNote')}
            </Text>
          </View>
        )}
        {remove.isError && (
          <Text role="small" tone="danger" align="center" style={{marginTop: 12}}>
            {toApiError(remove.error).kind === 'network' ? t('common.offline') : t('shelf.deleteError')}
          </Text>
        )}
        <View style={{gap: 8, marginTop: 18}}>
          <Button label={books.length ? t('shelf.deleteConfirmBooks') : t('shelf.deleteConfirm')} variant="danger" block loading={remove.isPending} onPress={() => remove.mutate()} />
          <Button label={t('common.cancel')} variant="line" block disabled={remove.isPending} onPress={() => setConfirmDelete(false)} style={{borderWidth: 0}} />
        </View>
      </Dialog>
    </View>
  );
};
