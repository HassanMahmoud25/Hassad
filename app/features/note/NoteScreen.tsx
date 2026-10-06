import React, {useRef, useState} from 'react';
import {AccessibilityInfo, Animated, I18nManager, Image, Pressable, Share, StyleSheet, useWindowDimensions, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter, ribbonFor} from '../../theme/tokens';
import {fonts} from '../../theme/type';
import {useT} from '../../lib/i18n';
import {currentLang} from '../../lib/locale';
import {detectScript, isolate} from '../../lib/text';
import {RootStackParamList} from '../../navigation/types';
import {barBottom} from '../../navigation/TabBar';
import {Button, Cover, Dialog, Glass, Icon, IconButton, IconName, MenuRow, Ribbon, Sheet, Skeleton, StateBlock, Text} from '../../ui';
import {Screen} from '../../ui/Screen';
import {coverTitle} from '../../ui/book/coverDesign';
import {useDeleteNote, useNote, useToggleSelection} from '../notes/notes';

type Props = NativeStackScreenProps<RootStackParamList, 'note'>;

const QUOTE_OPEN = /^\s*[«“"]/;

/**
 * The finished knowledge page (Design Lock v2, Note board). The note is the
 * hero: page number in the margin line, title in display type, paragraphs
 * at reading size, each in its own direction, and the book it came from.
 */
export const NoteScreen = ({route, navigation}: Props) => {
  const {colors, prefs} = useTheme();
  const {t, num} = useT();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const {bookId, noteId, note: initial} = route.params;
  const {note, book, position, next, loading, missing, refetch} = useNote(bookId, noteId, initial);
  const toggle = useToggleSelection();
  const remove = useDeleteNote();
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lang = currentLang();

  const top = (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14}}>
      <IconButton icon="back" label={t('common.back')} onPress={() => navigation.goBack()} />
      <View style={{flex: 1, alignItems: 'center'}}>
        {book && (
          <Pressable
            onPress={() => navigation.navigate('book', {book})}
            accessibilityRole="link"
            accessibilityLabel={`${t('note.fromBook')}: ${book.name}`}
            style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '100%', opacity: pressed ? 0.6 : 1})}>
            <Cover title={book.name} imageUrl={book.img_url} width={18} shadow="shelf" decorative />
            <Text role="label" numberOfLines={1} style={{flexShrink: 1}}>
              {coverTitle(book.name)}
            </Text>
          </Pressable>
        )}
      </View>
      {note ? (
        <IconButton
          icon="star"
          filled={note.favourated}
          color={note.favourated ? colors.gold : colors.ink}
          label={note.favourated ? t('note.selectRemove') : t('note.selectAdd')}
          onPress={() => {
            const select = !note.favourated;
            toggle.mutate({note, select});
            AccessibilityInfo.announceForAccessibility(select ? t('note.selectedNow') : t('note.unselectedNow'));
          }}
        />
      ) : (
        <View style={{width: 42}} />
      )}
    </View>
  );

  if (!note) {
    return (
      <Screen>
        <View style={{marginTop: -6}}>{top}</View>
        {loading ? (
          <View style={{paddingHorizontal: gutter, marginTop: 28, gap: 16}}>
            <Skeleton width={120} height={26} />
            <Skeleton width="80%" height={34} />
            <Skeleton width="100%" height={14} />
            <Skeleton width="92%" height={14} />
            <Skeleton width="70%" height={14} />
          </View>
        ) : (
          <StateBlock icon="info" title={missing ? t('note.missing') : t('note.loadError')} actionLabel={missing ? undefined : t('common.retry')} onAction={() => refetch()} />
        )}
      </Screen>
    );
  }

  const created = new Date(note.createdAt).toLocaleDateString(lang === 'ar' ? `ar-u-nu-${prefs.numerals === 'arab' ? 'arab' : 'latn'}` : 'en-GB', {day: 'numeric', month: 'long', year: 'numeric'});
  const paragraphs = (note.content ?? '').split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean);
  const bottom = barBottom(insets.bottom);

  const share = () => {
    const source = book ? t('note.shareSource', {book: isolate(book.name), page: num(note.page_number)}) : '';
    Share.share({message: [note.name, note.content?.trim(), source && `— ${source}`].filter(Boolean).join('\n\n')}).catch(() => {});
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.paper}}>
      <Animated.ScrollView
        contentContainerStyle={{paddingTop: insets.top + 64, paddingBottom: bottom + 64 + 40}}
        scrollEventThrottle={16}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true})}>
        <View style={{paddingHorizontal: gutter, marginTop: 4}}>
          {/* The margin line: page in gold ink, ribbon, hairline, date. */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Text role="meta" tone="ink3" style={{marginTop: 6}}>
              {t('book.pageMark')}
            </Text>
            <Text role="numeral" tone="gold" style={{fontSize: 33, lineHeight: 36}}>
              {num(note.page_number)}
            </Text>
            <Ribbon color={ribbonFor(note.color)} width={11} height={21} />
            <View style={{flex: 1, height: 1, backgroundColor: colors.rule, marginHorizontal: 6}} />
            <Text role="meta" tone="ink3">
              {created}
            </Text>
          </View>

          <Text role="display1" align="natural" accessibilityRole="header" style={{marginTop: 22}}>
            {note.name}
          </Text>

          {note.img_url ? (
            <Image source={{uri: note.img_url}} accessibilityIgnoresInvertColors style={{width: width - gutter * 2, aspectRatio: 4 / 3, borderRadius: 14, marginTop: 20, backgroundColor: colors.paper2}} resizeMode="cover" />
          ) : null}

          {paragraphs.map((p, i) =>
            QUOTE_OPEN.test(p) ? (
              <QuoteParagraph key={i} text={p.replace(/^\s*[«“"]|[»”"]\s*$/g, '')} />
            ) : (
              <Text key={i} role="read" align="natural" selectable style={{marginTop: i === 0 ? 20 : 16}}>
                {p}
              </Text>
            ),
          )}

          {book && (
            <>
              <View style={{height: 1, backgroundColor: colors.rule, marginTop: 30}} />
              <Pressable
                onPress={() => navigation.navigate('book', {book})}
                accessibilityRole="link"
                accessibilityLabel={[t('note.fromBook'), book.name, position ? t('note.position', {at: num(position.at), of: num(position.of)}) : null].filter(Boolean).join('، ')}
                style={({pressed}) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  marginTop: 20,
                  padding: 12,
                  borderRadius: 22,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.rule2,
                  opacity: pressed ? 0.7 : 1,
                })}>
                <Cover title={book.name} author={book.author} imageUrl={book.img_url} width={40} shadow="shelf" decorative />
                <View style={{flex: 1}}>
                  <Text role="meta" tone="ink3">
                    {t('note.fromBook')}
                  </Text>
                  <Text role="title" numberOfLines={2} style={{fontSize: 18, lineHeight: 24}}>
                    {coverTitle(book.name)}
                  </Text>
                  {position && (
                    <Text role="meta" tone="ink3">
                      {t('note.position', {at: num(position.at), of: num(position.of)})}
                    </Text>
                  )}
                </View>
                <Icon name="forward" size={18} color={colors.ink4} />
              </Pressable>
            </>
          )}
        </View>
      </Animated.ScrollView>

      {/* The top bar stays (like the Book screen); paper slides under it once
          the text scrolls. */}
      <View style={{position: 'absolute', top: 0, start: 0, end: 0, paddingTop: insets.top + 6, paddingBottom: 8}}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, {backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.rule2, opacity: scrollY.interpolate({inputRange: [0, 24], outputRange: [0, 1], extrapolate: 'clamp'})}]}
        />
        {top}
      </View>

      {/* Reading chrome floats; the page itself stays paper. */}
      <View style={{position: 'absolute', bottom, start: 16, end: 16}}>
        {/* An even 8pt inset all round keeps the next pill concentric with the bar (32 − 8 = 24). */}
        <Glass radius={32} style={{height: 64, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center'}}>
          <BarButton icon="edit" label={t('note.edit')} onPress={() => navigation.navigate('editor', {bookId, note})} />
          <BarButton icon="share" label={t('note.share')} onPress={share} />
          <BarButton icon="more" label={t('note.more')} onPress={() => setMoreOpen(true)} />
          <View style={{flex: 1}} />
          {next && (
            <Button
              label={t('note.next', {page: num(next.page_number)})}
              iconEnd="forward"
              size="sm"
              onPress={() => navigation.setParams({noteId: next._id, note: next})}
              // Button pins non-block buttons to the cross-axis start; centre it in the bar.
              style={{height: 48, borderRadius: 24, paddingHorizontal: 16, alignSelf: 'center'}}
            />
          )}
        </Glass>
      </View>

      <Sheet visible={moreOpen} onClose={() => setMoreOpen(false)} accessibilityLabel={t('note.actionsLabel')}>
        {book && <MenuRow first icon="read" label={t('note.openBook')} onPress={() => { setMoreOpen(false); navigation.navigate('book', {book}); }} />}
        <MenuRow first={!book} icon="star" label={note.favourated ? t('note.selectRemove') : t('note.selectAdd')} onPress={() => { setMoreOpen(false); toggle.mutate({note, select: !note.favourated}); }} />
        <MenuRow icon="trash" danger label={t('note.delete')} onPress={() => { setMoreOpen(false); setConfirmDelete(true); }} />
      </Sheet>

      <Dialog visible={confirmDelete} onClose={() => !remove.isPending && setConfirmDelete(false)}>
        <Text role="display3" align="center">
          {t('note.deleteTitle')}
        </Text>
        <Text role="title" align="center" tone="ink2" numberOfLines={2} style={{marginTop: 8, fontSize: 18}}>
          {note.name}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 8}}>
          {note.favourated ? t('note.deleteBodySelected') : t('note.deleteBody')}
        </Text>
        {remove.isError && (
          <Text role="small" tone="danger" align="center" style={{marginTop: 10}}>
            {t('note.deleteError')}
          </Text>
        )}
        <View style={{gap: 8, marginTop: 18}}>
          <Button
            label={t('note.deleteConfirm')}
            variant="danger"
            block
            loading={remove.isPending}
            onPress={() =>
              remove.mutate(note, {
                onSuccess: () => {
                  setConfirmDelete(false);
                  navigation.goBack();
                },
              })
            }
          />
          <Button label={t('common.cancel')} variant="line" block disabled={remove.isPending} onPress={() => setConfirmDelete(false)} style={{borderWidth: 0}} />
        </View>
      </Dialog>
    </View>
  );
};

const BarButton = ({icon, label, onPress}: {icon: IconName; label: string; onPress: () => void}) => {
  const {colors} = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4} style={({pressed}) => ({width: 64, height: 56, alignItems: 'center', justifyContent: 'center', gap: 3, opacity: pressed ? 0.55 : 1})}>
      <Icon name={icon} size={21} color={colors.ink} />
      <Text role="tab" color={colors.ink2}>
        {label}
      </Text>
    </Pressable>
  );
};

/**
 * A quoted passage hangs a gold mark in the margin (Note / NoteEN boards):
 * Arabic keeps upright Thmanyah with «; Latin turns to Newsreader italic
 * under a heavy serif “.
 */
const QuoteParagraph = ({text}: {text: string}) => {
  const {colors, readingScale} = useTheme();
  const rtl = detectScript(text, 'arabic') === 'arabic';
  // The mark sits on the paragraph's own start edge, whatever the UI direction.
  const side = rtl === I18nManager.isRTL ? {start: 0} : {end: 0};
  return (
    <View style={[{marginTop: 18}, rtl === I18nManager.isRTL ? {paddingStart: 28} : {paddingEnd: 28}]}>
      {rtl ? (
        <Text role="read" color={colors.gold} style={[{position: 'absolute', top: -2, fontFamily: fonts.plex[400]}, side]}>
          «
        </Text>
      ) : (
        <Text role="read" color={colors.gold} style={[{position: 'absolute', top: -6 * readingScale, fontFamily: fonts.newsreader[500], fontSize: 34 * readingScale, lineHeight: 40 * readingScale}, side]}>
          “
        </Text>
      )}
      <Text role="read" tone="ink2" align="natural" selectable style={rtl ? undefined : {fontFamily: fonts.newsreader.italic}}>
        {text}
      </Text>
    </View>
  );
};
