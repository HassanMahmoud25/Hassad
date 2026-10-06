import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, Platform, Pressable, ScrollView, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeProvider';
import {DEFAULT_NOTE_COLOR, gutter, NOTE_COLORS, NoteColor, ribbons} from '../../theme/tokens';
import {fonts} from '../../theme/type';
import {useT} from '../../lib/i18n';
import {currentLang, uiScript} from '../../lib/locale';
import {detectScript} from '../../lib/text';
import {toApiError} from '../../apis/errors';
import {RootStackParamList} from '../../navigation/types';
import {barBottom} from '../../navigation/TabBar';
import {Button, Cover, Dialog, Icon, Ribbon, Sheet, Text} from '../../ui';
import {coverTitle} from '../../ui/book/coverDesign';
import {useBookcase} from '../library/useBookcase';
import {BookChooser} from '../capture/BookChooser';
import {NoteDraft, parsePage, useSaveNote} from '../notes/notes';

type Props = NativeStackScreenProps<RootStackParamList, 'editor'>;

const draftKey = (bookId: string) => `hassad.draft.${bookId}`;
const asColor = (c?: string): NoteColor => (NOTE_COLORS.find(x => x === c?.toUpperCase()) ?? DEFAULT_NOTE_COLOR);

/**
 * Writing a note is writing on a page (Design Lock v2, Editor board): a page
 * token, the title in the reading face, the text at reading size, and a
 * solid ink bar riding on the keyboard. Add and Edit are the same page.
 */
export const EditorScreen = ({route, navigation}: Props) => {
  const {colors, prefs, readingScale} = useTheme();
  const {t, num} = useT();
  const insets = useSafeAreaInsets();
  const original = route.params.note;
  const editing = !!original;
  const [bookId, setBookId] = useState(route.params.bookId);
  const bookcase = useBookcase();
  const book = bookcase.all.find(b => b._id === bookId);
  const save = useSaveNote();

  const initial: NoteDraft = useMemo(
    () => (original ? {title: original.name, page: num(original.page_number), text: original.content ?? '', color: asColor(original.color)} : {title: '', page: '', text: '', color: DEFAULT_NOTE_COLOR}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [original?._id],
  );
  const [draft, setDraft] = useState<NoteDraft>(initial);
  const set = <K extends keyof NoteDraft>(k: K, v: NoteDraft[K]) => setDraft(d => ({...d, [k]: v}));
  const [touched, setTouched] = useState(false);
  const [draftReady, setDraftReady] = useState(editing);
  const [restored, setRestored] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [chooser, setChooser] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState<null | (() => void)>(null);
  const [photoNotice, setPhotoNotice] = useState(false);
  const [keyboard, setKeyboard] = useState(0);
  const [selection, setSelection] = useState({start: 0, end: 0});
  const [forcedSelection, setForcedSelection] = useState<{start: number; end: number} | undefined>();
  const pageRef = useRef<TextInput>(null);
  const titleRef = useRef<TextInput>(null);
  const textRef = useRef<TextInput>(null);
  const leaving = useRef(false);

  // New notes keep a draft on this device until saved or discarded.
  useEffect(() => {
    if (editing) {
      return;
    }
    AsyncStorage.getItem(draftKey(bookId))
      .then(raw => {
        const d = raw ? (JSON.parse(raw) as NoteDraft) : null;
        if (d && (d.title || d.page || d.text)) {
          setDraft({...d, color: asColor(d.color)});
          setRestored(true);
        }
      })
      .catch(() => {})
      .finally(() => setDraftReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (editing || !draftReady || leaving.current) {
      return;
    }
    const empty = !draft.title.trim() && !draft.page.trim() && !draft.text.trim();
    const id = setTimeout(() => {
      (empty ? AsyncStorage.removeItem(draftKey(bookId)) : AsyncStorage.setItem(draftKey(bookId), JSON.stringify(draft)))
        .then(() => setDraftSaved(!empty))
        .catch(() => {});
    }, 600);
    return () => clearTimeout(id);
  }, [draft, bookId, editing, draftReady]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e => setKeyboard(e.endCoordinates.height));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const dirty = editing && (draft.title !== initial.title || draft.page !== initial.page || draft.text !== initial.text || draft.color !== initial.color);
  // Leaving an edited note asks first; a new note's draft stays on the device.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (!dirty || leaving.current) {
          return;
        }
        e.preventDefault();
        setConfirmDiscard(() => () => navigation.dispatch(e.data.action));
      }),
    [navigation, dirty],
  );

  const page = parsePage(draft.page);
  const pageError = !draft.page.trim() ? t('editor.pageRequired') : page === null ? t('editor.pageInvalid') : undefined;
  const titleError = !draft.title.trim() ? t('editor.titleRequired') : undefined;
  const textCantClear = editing && !!original?.content?.trim() && !draft.text.trim();
  const serverError = save.error ? toApiError(save.error) : undefined;

  const submit = () => {
    setTouched(true);
    if (pageError) {
      pageRef.current?.focus();
      return;
    }
    if (titleError) {
      titleRef.current?.focus();
      return;
    }
    save.mutate(
      {bookId, draft, original},
      {
        onSuccess: saved => {
          leaving.current = true;
          AsyncStorage.removeItem(draftKey(bookId)).catch(() => {});
          if (editing) {
            navigation.goBack();
          } else {
            navigation.replace('note', {bookId, noteId: saved._id, note: saved});
          }
        },
      },
    );
  };

  const discardDraft = () => {
    AsyncStorage.removeItem(draftKey(bookId)).catch(() => {});
    setDraft(initial);
    setRestored(false);
    setDraftSaved(false);
  };

  const insertQuote = () => {
    const rtl = detectScript(draft.text, uiScript()) === 'arabic';
    const [open, close] = rtl ? ['«', '»'] : ['“', '”'];
    const {start, end} = selection;
    const text = draft.text.slice(0, start) + open + draft.text.slice(start, end) + close + draft.text.slice(end);
    set('text', text);
    const cursor = end + 1 + (end > start ? 1 : 0);
    setForcedSelection({start: cursor, end: cursor});
    textRef.current?.focus();
  };

  const fieldStyle = (value: string, kind: 'title' | 'text') => {
    const rtl = detectScript(value, uiScript()) === 'arabic';
    const base =
      kind === 'title'
        ? rtl
          ? {fontFamily: fonts.thmanyah[500], fontSize: 24.5, lineHeight: 36}
          : {fontFamily: fonts.newsreader[500], fontSize: 26, lineHeight: 32}
        : rtl
        ? {fontFamily: fonts.thmanyah[400], fontSize: 18 * readingScale, lineHeight: 34 * readingScale}
        : {fontFamily: fonts.newsreader[400], fontSize: 18.5 * readingScale, lineHeight: 30 * readingScale};
    return {...base, color: colors.ink, padding: 0, textAlign: rtl ? ('right' as const) : ('left' as const), writingDirection: rtl ? ('rtl' as const) : ('ltr' as const)};
  };

  // A new page is dated today, by weekday (Editor board); an existing note
  // keeps the date it shows on its own page (Note board).
  const date = (original ? new Date(original.createdAt) : new Date()).toLocaleDateString(
    currentLang() === 'ar' ? `ar-u-nu-${prefs.numerals === 'arab' ? 'arab' : 'latn'}` : 'en-GB',
    original ? {day: 'numeric', month: 'long', year: 'numeric'} : {weekday: 'long', day: 'numeric', month: 'long'},
  );
  const barAt = keyboard > 0 ? keyboard + 8 : barBottom(insets.bottom);

  return (
    <View style={{flex: 1, backgroundColor: colors.paper}}>
      {/* Top: cancel · the book · save */}
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: insets.top + 10, paddingHorizontal: 16}}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" hitSlop={10} style={({pressed}) => ({minWidth: 56, opacity: pressed ? 0.5 : 1})}>
          <Text role="label" tone="ink2">
            {t('editor.cancel')}
          </Text>
        </Pressable>
        <View style={{flex: 1, alignItems: 'center'}}>
          {book && (
            <Pressable
              onPress={editing ? undefined : () => setChooser(true)}
              disabled={editing}
              accessibilityRole={editing ? 'text' : 'button'}
              accessibilityLabel={t('editor.bookChip', {title: book.name})}
              accessibilityHint={editing ? undefined : t('editor.changeBook')}
              style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 8, height: 38, paddingHorizontal: 12, borderRadius: 19, backgroundColor: colors.paper2, maxWidth: '100%', opacity: pressed ? 0.7 : 1})}>
              <Cover title={book.name} imageUrl={book.img_url} width={16} shadow="none" decorative />
              <Text role="label" numberOfLines={1} style={{flexShrink: 1}}>
                {coverTitle(book.name)}
              </Text>
              {!editing && <Icon name="chevronDown" size={14} color={colors.ink3} />}
            </Pressable>
          )}
        </View>
        <Button label={t('editor.save')} size="sm" loading={save.isPending} onPress={submit} />
      </View>
      {(restored || draftSaved) && !editing ? (
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10}}>
          <Icon name="check" size={14} color={colors.ink3} />
          <Text role="meta" tone="ink3">
            {restored ? t('editor.draftRestored') : t('editor.draftSaved')}
          </Text>
          {restored && (
            <Pressable onPress={discardDraft} accessibilityRole="button" hitSlop={8}>
              <Text role="meta" tone="ink2" style={{textDecorationLine: 'underline'}}>
                {t('editor.discardDraft')}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingHorizontal: gutter, paddingTop: 22, paddingBottom: barAt + 56 + 40}}>
        {/* Page token, ribbon, date */}
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Pressable
            onPress={() => pageRef.current?.focus()}
            style={{flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.paper2, borderWidth: touched && pageError ? 1.5 : 0, borderColor: colors.danger}}>
            <Text role="label" tone="ink3">
              {t('book.pageMark')}
            </Text>
            <TextInput
              ref={pageRef}
              value={draft.page}
              onChangeText={v => set('page', v.replace(/[^\d٠-٩۰-۹]/g, ''))}
              keyboardType="number-pad"
              // A new note starts where the reader is: the page.
              autoFocus={!editing}
              maxLength={6}
              placeholder="—"
              placeholderTextColor={colors.ink4}
              accessibilityLabel={t('editor.pageField')}
              selectionColor={colors.gold}
              cursorColor={colors.ink}
              returnKeyType="next"
              onSubmitEditing={() => titleRef.current?.focus()}
              style={{fontFamily: fonts.thmanyah[500], fontSize: 22, color: colors.goldInk, padding: 0, minWidth: 54, textAlign: 'center'}}
            />
          </Pressable>
          <Ribbon color={ribbons[draft.color].ribbon} width={12} height={23} />
          <View style={{flex: 1}} />
          <Text role="meta" tone="ink3">
            {date}
          </Text>
        </View>
        {touched && pageError ? (
          <Text role="meta" tone="danger" style={{marginTop: 6}}>
            {pageError}
          </Text>
        ) : null}

        <TextInput
          ref={titleRef}
          value={draft.title}
          onChangeText={v => set('title', v.replace(/\n/g, ' '))}
          placeholder={t('editor.titlePlaceholder')}
          placeholderTextColor={colors.ink4}
          accessibilityLabel={t('editor.titleField')}
          multiline
          blurOnSubmit
          returnKeyType="next"
          onSubmitEditing={() => textRef.current?.focus()}
          selectionColor={colors.gold}
          cursorColor={colors.ink}
          maxLength={200}
          style={[fieldStyle(draft.title, 'title'), {marginTop: 24}]}
        />
        {touched && titleError ? (
          <Text role="meta" tone="danger" style={{marginTop: 4}}>
            {titleError}
          </Text>
        ) : null}

        <TextInput
          ref={textRef}
          value={draft.text}
          onChangeText={v => set('text', v)}
          onSelectionChange={e => {
            setSelection(e.nativeEvent.selection);
            setForcedSelection(undefined);
          }}
          selection={forcedSelection}
          placeholder={t('editor.textPlaceholder')}
          placeholderTextColor={colors.ink4}
          accessibilityLabel={t('editor.textField')}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          selectionColor={colors.gold}
          cursorColor={colors.ink}
          style={[fieldStyle(draft.text, 'text'), {marginTop: 18, minHeight: 220}]}
        />
        {textCantClear ? (
          <Text role="meta" tone="ink3" style={{marginTop: 6}}>
            {t('editor.textCantClear')}
          </Text>
        ) : null}
        {serverError ? (
          <Text role="small" tone="danger" style={{marginTop: 10}}>
            {serverError.kind === 'network' ? t('common.offline') : serverError.kind === 'validation' ? serverError.message : t('editor.saveError')}
          </Text>
        ) : null}
      </ScrollView>

      {photoNotice ? (
        <View style={{position: 'absolute', bottom: barAt + 64, start: 16, end: 16, padding: 12, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.rule}}>
          <Text role="small" tone="ink2">
            {t('editor.photoUnavailable')}
          </Text>
        </View>
      ) : null}

      {/* The solid ink bar: tools beat translucency when you write. */}
      <View
        style={{position: 'absolute', bottom: barAt, start: 10, end: 10, height: 56, borderRadius: 28, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 2, boxShadow: '0px 14px 28px -12px rgba(20,12,4,0.55)'}}>
        <InkButton label={t('editor.pageButton')} onPress={() => pageRef.current?.focus()}>
          <Text role="label" color={colors.onInk} style={{fontFamily: fonts.thmanyah[500], fontSize: 16}}>
            {t('book.pageMark')}
          </Text>
        </InkButton>
        <InkButton label={t('editor.photoButton')} onPress={() => setPhotoNotice(v => !v)} dim>
          <Icon name="image" size={20} color={colors.onInk} />
        </InkButton>
        <InkButton label={t('editor.quoteButton')} onPress={insertQuote}>
          {currentLang() === 'ar' ? (
            <Text role="label" color={colors.onInk} style={{fontFamily: fonts.plex[400], fontSize: 17}}>
              «»
            </Text>
          ) : (
            <Text role="label" color={colors.onInk} style={{fontFamily: fonts.newsreader[500], fontSize: 26, lineHeight: 30, marginTop: 8}}>
              “”
            </Text>
          )}
        </InkButton>
        <View style={{width: 1, height: 26, backgroundColor: colors.onInk, opacity: 0.2, marginHorizontal: 6}} />
        <View accessibilityRole="radiogroup" style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
          {NOTE_COLORS.map(c => {
            const on = draft.color === c;
            return (
              <Pressable
                key={c}
                onPress={() => set('color', c)}
                accessibilityRole="radio"
                accessibilityState={{checked: on}}
                accessibilityLabel={t('editor.ribbonLabel', {name: t(`editor.ribbons.${ribbons[c].name}`)})}
                hitSlop={4}
                style={{width: 32, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: on ? 1.5 : 0, borderColor: colors.onInk}}>
                <Ribbon color={ribbons[c].ribbon} width={11} height={20} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <Sheet visible={chooser} onClose={() => setChooser(false)} accessibilityLabel={t('editor.changeBook')}>
        <Text role="display3" style={{marginBottom: 10}}>
          {t('capture.subtitle')}
        </Text>
        <BookChooser
          books={bookcase.all}
          selectedId={bookId}
          onSelect={b => {
            AsyncStorage.removeItem(draftKey(bookId)).catch(() => {});
            setBookId(b._id);
            setChooser(false);
          }}
          onNewBook={() => {
            setChooser(false);
            navigation.navigate('bookForm', {folderId: null});
          }}
        />
      </Sheet>

      <Dialog visible={!!confirmDiscard} onClose={() => setConfirmDiscard(null)}>
        <Text role="display3" align="center">
          {t('editor.discardTitle')}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 8}}>
          {t('editor.discardBody')}
        </Text>
        <View style={{gap: 8, marginTop: 18}}>
          <Button
            label={t('editor.discard')}
            variant="danger"
            block
            onPress={() => {
              const go = confirmDiscard;
              leaving.current = true;
              setConfirmDiscard(null);
              go?.();
            }}
          />
          <Button label={t('editor.keepEditing')} variant="line" block onPress={() => setConfirmDiscard(null)} style={{borderWidth: 0}} />
        </View>
      </Dialog>
    </View>
  );
};

const InkButton = ({label, onPress, dim, children}: {label: string; onPress: () => void; dim?: boolean; children: React.ReactNode}) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4} style={({pressed}) => ({width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : dim ? 0.42 : 1})}>
    {children}
  </Pressable>
);
