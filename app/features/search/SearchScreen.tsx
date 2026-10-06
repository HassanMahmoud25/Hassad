import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Platform, Pressable, ScrollView, SectionList, Text as RNText, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter, ribbonFor, withAlpha} from '../../theme/tokens';
import {fonts, TextRole} from '../../theme/type';
import {useT} from '../../lib/i18n';
import {currentLang, uiScript} from '../../lib/locale';
import {pluralForm} from '../../lib/plural';
import {detectScript} from '../../lib/text';
import {excerptAround} from '../../lib/search';
import {RootStackParamList} from '../../navigation/types';
import {Benefit, Book} from '../../apis/types';
import {Chip, Cover, Icon, IconButton, Ribbon, ShelfRow, Skeleton, StateBlock, Text} from '../../ui';
import {coverTitle} from '../../ui/book/coverDesign';
import {BookHit, NoteHit, Scope, ShelfHit, useSearch} from './useSearch';

type Props = NativeStackScreenProps<RootStackParamList, 'search'>;
type Filter = 'all' | 'notes' | 'books' | 'shelves';

const RECENT_KEY = 'hassad.recentSearches';

/**
 * Searching a personal library (Design Lock v2, SearchIdle/SearchResults):
 * notes grouped under their book with the match marked, then books, then
 * shelves. Runs on the device — there is no search route.
 */
export const SearchScreen = ({route, navigation}: Props) => {
  const {colors} = useTheme();
  const {t, num} = useT();
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<Scope>(route.params ?? {});
  const [raw, setRaw] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [focused, setFocused] = useState(true);
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<TextInput>(null);
  const s = useSearch(debounced, scope);
  const scoped = !!(scope.bookId || scope.folderId || scope.selections);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(raw), 160);
    return () => clearTimeout(id);
  }, [raw]);
  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then(v => setRecent(v ? JSON.parse(v) : []))
      .catch(() => {});
  }, []);
  const remember = (q: string) => {
    const v = q.trim();
    if (!v) {
      return;
    }
    const next = [v, ...recent.filter(r => r !== v)].slice(0, 8);
    setRecent(next);
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
  };
  const forget = (q?: string) => {
    const next = q ? recent.filter(r => r !== q) : [];
    setRecent(next);
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
  };

  const matches = (n: number) => {
    const form = pluralForm(n, currentLang());
    const key = `search.matches_${form}`;
    const v = t(key, {n: num(n)});
    return v.endsWith(key) ? t('search.matches_other', {n: num(n)}) : v;
  };

  const openNote = (note: Benefit) => {
    remember(raw);
    navigation.navigate('note', {bookId: note.book, noteId: note._id, note});
  };
  const openBook = (book: Book) => {
    remember(raw);
    navigation.navigate('book', {book});
  };

  const placeholder = scope.bookId ? t('search.placeholderBook') : scope.folderId ? t('search.placeholderShelf') : scope.selections ? t('search.placeholderSelections') : t('search.placeholder');
  const scopeName = s.scopeBook ? coverTitle(s.scopeBook.name) : s.scopeShelf ? s.scopeShelf.name : scope.selections ? t('search.selections') : '';

  // ── Sections for the results list ──
  type Row = {kind: 'note'; hit: NoteHit; first: boolean} | {kind: 'book'; hit: BookHit} | {kind: 'shelf'; hit: ShelfHit};
  const sections = useMemo(() => {
    const out: {key: string; title?: React.ReactNode; data: Row[]}[] = [];
    if (filter === 'all' || filter === 'notes') {
      for (const g of s.groups) {
        out.push({
          key: `g-${g.bookId}`,
          title: <GroupHead book={g.book} label={matches(g.hits.length)} onPress={g.book ? () => openBook(g.book!) : undefined} hideBook={!!scope.bookId} />,
          data: g.hits.map((hit, i) => ({kind: 'note' as const, hit, first: i === 0})),
        });
      }
    }
    if ((filter === 'all' || filter === 'books') && s.books.length) {
      out.push({key: 'books', title: <SectionLabel>{t('search.books')}</SectionLabel>, data: s.books.map(hit => ({kind: 'book' as const, hit}))});
    }
    if ((filter === 'all' || filter === 'shelves') && s.shelves.length) {
      out.push({key: 'shelves', title: <SectionLabel>{t('search.shelves')}</SectionLabel>, data: s.shelves.map(hit => ({kind: 'shelf' as const, hit}))});
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.groups, s.books, s.shelves, filter, scope.bookId]);

  const total = s.noteCount + s.books.length + s.shelves.length;
  const searching = !!s.query;
  const indexing = s.toIndex > 0 && s.indexed < s.toIndex;
  const arabicQuery = detectScript(raw, 'latin') === 'arabic';

  const header = (
    <View style={{paddingTop: insets.top + 10, paddingHorizontal: gutter, gap: 12, paddingBottom: 6, backgroundColor: colors.paper}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
        <View
          style={{
            flex: 1,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: focused ? colors.ink : colors.rule,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 14,
          }}>
          <Icon name="search" size={20} color={colors.ink2} />
          <TextInput
            ref={input}
            value={raw}
            onChangeText={setRaw}
            autoFocus
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => remember(raw)}
            placeholder={placeholder}
            placeholderTextColor={colors.ink4}
            returnKeyType="search"
            accessibilityLabel={placeholder}
            selectionColor={colors.gold}
            cursorColor={colors.ink}
            style={{
              flex: 1,
              padding: 0,
              fontFamily: fonts.plex[400],
              fontSize: 16,
              color: colors.ink,
              textAlign: detectScript(raw, uiScript()) === 'arabic' ? 'right' : 'left',
            }}
          />
          {raw ? <IconButton icon="close" label={t('search.clear')} small variant="fill" onPress={() => {
                setRaw('');
                input.current?.focus();
              }}
              style={{marginEnd: -6}}
            /> : null}
        </View>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" hitSlop={10}>
          <Text role="label" tone="ink2">
            {t('search.cancel')}
          </Text>
        </Pressable>
      </View>

      {scoped ? (
        <View style={{flexDirection: 'row'}}>
          <Chip
            small
            icon={scope.selections ? 'star' : scope.folderId ? 'shelf' : 'read'}
            label={t('search.within', {name: scopeName})}
            onPress={() => setScope({})}
            style={{paddingEnd: 8}}
          />
          <Pressable onPress={() => setScope({})} accessibilityRole="button" accessibilityLabel={t('search.removeScope')} hitSlop={10} style={{justifyContent: 'center', paddingHorizontal: 8}}>
            <Icon name="close" size={14} color={colors.ink3} />
          </Pressable>
        </View>
      ) : null}

      {!scope.bookId && !scope.selections ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8}}>
          {(['all', 'notes', 'books', 'shelves'] as Filter[])
            .filter(f => !(scope.folderId && f === 'shelves'))
            .map(f => {
              const n = f === 'all' ? total : f === 'notes' ? s.noteCount : f === 'books' ? s.books.length : s.shelves.length;
              // Counts once there is a query; an empty kind is dimmed (SearchResults board).
              const empty = searching && n === 0 && f !== 'all' && filter !== f;
              return (
                <Chip
                  key={f}
                  label={searching ? `${t(`search.${f}`)} ${num(n)}` : t(`search.${f}`)}
                  on={filter === f}
                  onPress={empty ? undefined : () => setFilter(f)}
                  style={empty ? {opacity: 0.55} : undefined}
                />
              );
            })}
        </ScrollView>
      ) : null}

      {searching && (indexing || s.failedBooks > 0) ? (
        <View style={{gap: 6}}>
          {indexing ? (
            <>
              <Text role="meta" tone="ink3">
                {t('search.indexing', {done: num(s.indexed), total: num(s.toIndex)})}
              </Text>
              <View style={{height: 2, borderRadius: 1, backgroundColor: colors.rule2}}>
                <View style={{height: 2, borderRadius: 1, backgroundColor: colors.gold, width: `${Math.round((s.indexed / s.toIndex) * 100)}%`}} />
              </View>
            </>
          ) : (
            <Pressable onPress={s.retryNotes} accessibilityRole="button" style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="retry" size={14} color={colors.danger} />
              <Text role="meta" tone="danger">
                {t('search.partialError', {books: num(s.failedBooks)})} {t('search.retry')}
              </Text>
            </Pressable>
          )}
        </View>
      ) : searching && arabicQuery && total > 0 ? (
        <Text role="meta" tone="ink3">
          {t('search.folding')}
        </Text>
      ) : null}
    </View>
  );

  if (s.error) {
    return (
      <View style={{flex: 1, backgroundColor: colors.paper}}>
        {header}
        <StateBlock icon={s.error.kind === 'network' ? 'offline' : 'info'} title={s.error.kind === 'network' ? t('library.offlineTitle') : t('library.errorTitle')} body={t('harvest.errorBody')} />
      </View>
    );
  }

  if (!searching) {
    return (
      <View style={{flex: 1, backgroundColor: colors.paper}}>
        {header}
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom: insets.bottom + 32}}>
          {recent.length > 0 && (
            <View style={{paddingHorizontal: gutter, marginTop: 18}}>
              <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 8}}>
                <Text role="title" style={{flex: 1}}>
                  {t('search.recent')}{' '}
                  <Text role="meta" tone="ink4">
                    {t('search.recentNote')}
                  </Text>
                </Text>
                <Pressable onPress={() => forget()} accessibilityRole="button" hitSlop={8}>
                  <Text role="label" tone="ink3">
                    {t('search.clearRecent')}
                  </Text>
                </Pressable>
              </View>
              {recent.map((q, i) => (
                <View key={q} style={{flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.rule2}}>
                  <Icon name="clock" size={18} color={colors.ink3} />
                  <Pressable onPress={() => setRaw(q)} accessibilityRole="button" style={{flex: 1, paddingVertical: 12}}>
                    <Text role="body" align="start" numberOfLines={1}>
                      {q}
                    </Text>
                  </Pressable>
                  <IconButton icon="close" small variant="bare" label={t('search.removeRecent', {q})} onPress={() => forget(q)} color={colors.ink3} />
                </View>
              ))}
            </View>
          )}

          {recent.length === 0 && (
            <Text role="small" tone="ink3" style={{paddingHorizontal: gutter, marginTop: 18}}>
              {t('search.idleHint')}
            </Text>
          )}

          {!scoped && s.recentBooks.length > 0 && (
            <View style={{marginTop: 30}}>
              <Text role="title" style={{paddingHorizontal: gutter, marginBottom: 2}}>
                {t('search.insideBook')}
              </Text>
              <ShelfRow
                title=""
                hideHeader
                books={s.recentBooks.map(b => ({id: b._id, title: b.name, author: b.author, imageUrl: b.img_url}))}
                onPressBook={b => setScope({bookId: b.id})}
              />
            </View>
          )}

          {!scoped && (s.selectionsCount ?? 0) > 0 && (
            <View style={{paddingHorizontal: gutter, marginTop: 30}}>
              <Text role="title">{t('search.shortcuts')}</Text>
              <Pressable onPress={() => setScope({selections: true})} accessibilityRole="button" style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, opacity: pressed ? 0.6 : 1})}>
                <View style={{width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.rule, alignItems: 'center', justifyContent: 'center'}}>
                  <Icon name="star" size={16} color={colors.gold} filled />
                </View>
                <Text role="body" style={{flex: 1}}>
                  {t('search.selections')}
                </Text>
                <Text role="meta" tone="ink3">
                  {num(s.selectionsCount ?? 0)}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.paper}}>
      {header}
      {s.loading ? (
        <View style={{paddingHorizontal: gutter, marginTop: 18, gap: 24}}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{flexDirection: 'row', gap: 12}}>
              <View style={{width: 46, alignItems: 'center', gap: 6}}>
                <Skeleton width={14} height={8} />
                <Skeleton width={26} height={18} />
              </View>
              <View style={{flex: 1, gap: 9}}>
                <Skeleton width="58%" height={14} />
                <Skeleton width="90%" height={10} />
              </View>
            </View>
          ))}
        </View>
      ) : total === 0 && !indexing ? (
        <View style={{alignItems: 'center', paddingHorizontal: 36, marginTop: 48}}>
          <Icon name="search" size={28} color={colors.ink4} />
          <Text role="display3" align="center" style={{marginTop: 14}}>
            {t('search.noResultsTitle', {q: raw.trim()})}
          </Text>
          <Text role="body" tone="ink2" align="center" style={{marginTop: 6}}>
            {scoped || filter !== 'all' ? t('search.noResultsScoped', {q: raw.trim()}) : t('search.noResultsBody')}
          </Text>
          {scoped && (
            <Pressable onPress={() => setScope({})} accessibilityRole="button" style={{marginTop: 14, padding: 8}}>
              <Text role="label" style={{textDecorationLine: 'underline'}}>
                {t('search.removeScope')}
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(row, i) => (row.kind === 'note' ? row.hit.note._id : row.kind === 'book' ? row.hit.book._id : row.hit.folder._id) + i}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{paddingHorizontal: gutter, paddingBottom: insets.bottom + 40}}
          renderSectionHeader={({section}) => <View style={{marginTop: 16}}>{section.title}</View>}
          renderItem={({item}) =>
            item.kind === 'note' ? (
              <NoteHitRow hit={item.hit} first={item.first} onPress={() => openNote(item.hit.note)} />
            ) : item.kind === 'book' ? (
              <BookHitRow hit={item.hit} onPress={() => openBook(item.hit.book)} />
            ) : (
              <ShelfHitRow hit={item.hit} onPress={() => navigation.navigate('shelf', {folderId: item.hit.folder._id})} />
            )
          }
        />
      )}
    </View>
  );
};

/** Matched ranges washed in gold, as bare spans for use inside another Text. */
const MarkedSpans = ({text, ranges}: {text: string; ranges: [number, number][]}) => {
  const {colors, isDark} = useTheme();
  return <>{markParts(text, ranges, colors.gold, colors.ink, isDark)}</>;
};

const markParts = (text: string, ranges: [number, number][], gold: string, ink: string, isDark: boolean) => {
  const parts: React.ReactNode[] = [];
  let at = 0;
  ranges.forEach(([s, e], i) => {
    if (s > at) {
      parts.push(text.slice(at, s));
    }
    parts.push(
      <RNText
        key={i}
        style={[
          {backgroundColor: withAlpha(gold, isDark ? 0.34 : 0.2), color: ink},
          // Android can't colour an underline, and an ink one is too heavy.
          Platform.OS === 'ios' && {textDecorationLine: 'underline', textDecorationColor: gold},
        ]}>
        {text.slice(s, e)}
      </RNText>,
    );
    at = e;
  });
  if (at < text.length) {
    parts.push(text.slice(at));
  }
  return parts;
};

/** Text with matched ranges washed in gold. Bare spans keep the paragraph's alignment. */
const Marked = ({text, ranges, role, tone, lines}: {text: string; ranges: [number, number][]; role: TextRole; tone?: 'ink' | 'ink2'; lines: number}) => {
  const {colors, isDark} = useTheme();
  const parts = markParts(text, ranges, colors.gold, colors.ink, isDark);
  return (
    <Text role={role} tone={tone} align="natural" numberOfLines={lines}>
      {parts}
    </Text>
  );
};


const GroupHead = ({book, label, onPress, hideBook}: {book?: Book; label: string; onPress?: () => void; hideBook?: boolean}) => {
  const {colors} = useTheme();
  if (hideBook) {
    return (
      <Text role="meta" tone="ink3" style={{marginBottom: 4}}>
        {label}
      </Text>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole="link" style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.rule, opacity: pressed ? 0.6 : 1})}>
      {book && <Cover title={book.name} imageUrl={book.img_url} width={22} shadow="shelf" decorative />}
      <Text role="title" numberOfLines={1} style={{flex: 1, fontSize: 18, lineHeight: 24}}>
        {book ? coverTitle(book.name) : '—'}
      </Text>
      <Text role="meta" tone="ink3">
        {label}
      </Text>
    </Pressable>
  );
};

const SectionLabel = ({children}: {children: string}) => {
  const {colors} = useTheme();
  return (
    <View style={{paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.rule, marginTop: 10}}>
      <Text role="eyebrow" tone="gold">
        {children}
      </Text>
    </View>
  );
};

const NoteHitRow = ({hit, first, onPress}: {hit: NoteHit; first: boolean; onPress: () => void}) => {
  const {colors} = useTheme();
  const {t, num} = useT();
  // One run of text: same length, so match ranges still line up.
  const excerpt = excerptAround((hit.note.content ?? '').replace(/\s/g, ' '), hit.text);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${hit.note.name}، ${t('book.pageMark')} ${num(hit.note.page_number)}`}
      style={({pressed}) => ({flexDirection: 'row', gap: 12, paddingVertical: 16, borderTopWidth: first ? 0 : 1, borderTopColor: colors.rule2, opacity: pressed ? 0.6 : 1})}>
      <View style={{width: 46, alignItems: 'center', paddingTop: 3}}>
        <Text role="meta" tone="ink3" align="center" style={{fontSize: 10, lineHeight: 12, marginBottom: 5}}>
          {t('book.pageMark')}
        </Text>
        <Text role="numeral" tone="gold" align="center" style={{lineHeight: 22}} numberOfLines={1} adjustsFontSizeToFit>
          {num(hit.note.page_number)}
        </Text>
        <View style={{marginTop: 9}}>
          <Ribbon color={ribbonFor(hit.note.color)} />
        </View>
      </View>
      <View style={{flex: 1}}>
        <Marked text={hit.note.name} ranges={hit.title} role="title" lines={2} />
        {hit.note.content ? <Marked text={excerpt.text} ranges={excerpt.ranges} role="excerpt" tone="ink2" lines={2} /> : null}
      </View>
    </Pressable>
  );
};

const BookHitRow = ({hit, onPress}: {hit: BookHit; onPress: () => void}) => {
  const {colors} = useTheme();
  const {t, count} = useT();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={hit.book.name} style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.rule2, opacity: pressed ? 0.6 : 1})}>
      <Cover title={hit.book.name} author={hit.book.author} imageUrl={hit.book.img_url} width={40} shadow="shelf" decorative />
      <View style={{flex: 1}}>
        <Marked text={hit.book.name} ranges={hit.title} role="title" lines={2} />
        <Text role="meta" tone="ink3" numberOfLines={1}>
          {hit.book.author ? (
            <>
              <MarkedSpans text={hit.book.author} ranges={hit.author} />
              {' · '}
            </>
          ) : null}
          {hit.book.num_of_benefits ? count('notes', hit.book.num_of_benefits) : t('capture.noNotesYet')}
        </Text>
      </View>
      <Icon name="forward" size={16} color={colors.ink4} />
    </Pressable>
  );
};

const ShelfHitRow = ({hit, onPress}: {hit: ShelfHit; onPress: () => void}) => {
  const {colors} = useTheme();
  const {count} = useT();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={hit.folder.name} style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.rule2, opacity: pressed ? 0.6 : 1})}>
      <View style={{width: 40, alignItems: 'center'}}>
        <Icon name="shelf" size={22} color={colors.ink2} />
      </View>
      <View style={{flex: 1}}>
        <Marked text={hit.folder.name} ranges={hit.name} role="title" lines={1} />
        <Text role="meta" tone="ink3">
          {count('books', hit.books)}
        </Text>
      </View>
      <Icon name="forward" size={16} color={colors.ink4} />
    </Pressable>
  );
};

