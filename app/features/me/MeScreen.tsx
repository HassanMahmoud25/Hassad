import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, Text as RNText, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter} from '../../theme/tokens';
import {AR_SERIF, fonts, ReadingSize} from '../../theme/type';
import {useAuth} from '../../contexts/AuthContext';
import {currentLang, Lang, setLanguage} from '../../lib/locale';
import {useT} from '../../lib/i18n';
import {pluralForm} from '../../lib/plural';
import {detectScript, isolate} from '../../lib/text';
import {getFavoriteBenefits} from '../../apis/favorites.api';
import {queryKeys} from '../../queries/queryKeys';
import {
  Button,
  Dialog,
  Icon,
  IconButton,
  IconName,
  Seal,
  SectionHead,
  Skeleton,
  Switcher,
  Text,
} from '../../ui';
import {Screen} from '../../ui/Screen';
import {coverTitle} from '../../ui/book/coverDesign';
import {useBookcase} from '../library/useBookcase';
import {NEWEST} from '../notes/notes';
import {LanguageTransition} from './LanguageTransition';
import {verifiedKey} from '../auth/VerifyEmailScreen';

const SIZES: ReadingSize[] = ['small', 'default', 'large', 'xlarge'];
const GLYPH_SIZE: Record<ReadingSize, number> = {
  small: 15,
  default: 18,
  large: 21,
  xlarge: 25,
};

/**
 * «أنا» — the reader inside their own library (Profile + Settings boards):
 * the seal, what the library holds, what they chose to keep, then quiet
 * preferences and the account. Only what the backend can honestly return.
 */
export const MeScreen = () => {
  const {colors, prefs, setPref} = useTheme();
  const {t, num} = useT();
  const navigation = useNavigation();
  const {user, logout} = useAuth();
  const bookcase = useBookcase();
  const selections = useQuery({
    queryKey: queryKeys.favorites.list(NEWEST),
    queryFn: () => getFavoriteBenefits(NEWEST),
  });
  const [switching, setSwitching] = useState<Lang | null>(null);
  const [verified, setVerified] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const lang = currentLang();

  const name = user?.first_name?.trim();
  const email = user?.email ?? '';
  // Re-read on focus: confirmation happens on its own screen.
  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        AsyncStorage.getItem(verifiedKey(user._id))
          .then(v => setVerified(v === '1'))
          .catch(() => {});
      }
    }, [user?._id]),
  );

  const settled = !bookcase.loading && bookcase.shelves.every(s => !s.loading);
  const firstBook = useMemo(
    () =>
      [...bookcase.all].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      )[0],
    [bookcase.all],
  );
  const firstBookDate = firstBook
    ? new Date(firstBook.createdAt).toLocaleDateString(
        lang === 'ar'
          ? `ar-u-nu-${prefs.numerals === 'arab' ? 'arab' : 'latn'}`
          : 'en-GB',
        {month: 'long', year: 'numeric'},
      )
    : null;
  const byId = useMemo(
    () => new Map(bookcase.all.map(b => [b._id, b])),
    [bookcase.all],
  );
  const picked = selections.data ?? [];

  const unit = (key: 'books' | 'notes' | 'shelves' | 'selected', n: number) => {
    const k = `facts.${key}_${pluralForm(n, lang)}`;
    const v = t(k);
    return v.endsWith(k) ? t(`facts.${key}_other`) : v;
  };

  const goSelections = () =>
    navigation.navigate('tabs', {screen: 'selections'});
  const onLanguageShown = useCallback(() => {
    if (switching) {
      setLanguage(switching, 'me');
    }
  }, [switching]);

  return (
    <Screen>
      <View
        style={{flexDirection: 'row', paddingHorizontal: 14, marginTop: -6}}>
        <IconButton
          icon="back"
          label={t('me.back')}
          onPress={() => navigation.goBack()}
        />
      </View>

      {/* Identity: the seal, then who and since when — nothing invented. */}
      <View
        style={{alignItems: 'center', paddingHorizontal: gutter, marginTop: 4}}>
        <Seal
          name={name || email || '·'}
          size={92}
          accessibilityLabel={name || email}
        />
        <Text
          role="display1"
          align="center"
          accessibilityRole="header"
          style={{marginTop: 20}}>
          {name || t('me.title')}
        </Text>
        {email ? (
          <Text
            role="small"
            tone="ink2"
            align="center"
            script="latin"
            style={{marginTop: 2}}>
            {email}
          </Text>
        ) : null}
        {firstBookDate ? (
          <Text role="meta" tone="ink3" align="center" style={{marginTop: 4}}>
            {t('me.firstBook', {date: firstBookDate})}
          </Text>
        ) : null}
      </View>

      {/* What the library holds: four figures between hairlines. */}
      {!settled ? (
        <View
          style={{
            marginHorizontal: gutter,
            marginTop: 26,
            paddingVertical: 18,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.rule,
            flexDirection: 'row',
          }}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={{flex: 1, alignItems: 'center', gap: 8}}>
              <Skeleton width={34} height={24} />
              <Skeleton width={44} height={10} />
            </View>
          ))}
        </View>
      ) : bookcase.totals.books > 0 ? (
        <View
          accessible
          accessibilityLabel={(
            [
              ['books', bookcase.totals.books],
              ['notes', bookcase.totals.notes],
              ['shelves', bookcase.totals.shelves],
              ['selected', picked.length],
            ] as const
          )
            .filter(([, n]) => n > 0)
            .map(([k, n]) => `${num(n)} ${unit(k, n)}`)
            .join('، ')}
          style={{
            marginHorizontal: gutter,
            marginTop: 26,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.rule,
            flexDirection: 'row',
          }}>
          {(
            [
              ['books', bookcase.totals.books],
              ['notes', bookcase.totals.notes],
              ['shelves', bookcase.totals.shelves],
              ['selected', picked.length],
            ] as const
          )
            // Facts, not a dashboard: a zero is simply not mentioned.
            .filter(([, n]) => n > 0)
            .map(([key, n], i) => (
              <React.Fragment key={key}>
                {/* A hairline between figures (borderStart lands on the wrong side in RTL here). */}
                {i > 0 && (
                  <View
                    style={{
                      width: 1,
                      backgroundColor: colors.rule2,
                      marginVertical: 2,
                    }}
                  />
                )}
                <View style={{flex: 1, alignItems: 'center', gap: 2}}>
                  <Text
                    role="numeral"
                    tone={key === 'selected' ? 'gold' : 'ink'}
                    align="center"
                    style={{fontSize: 30, lineHeight: 36}}>
                    {num(n)}
                  </Text>
                  <Text role="meta" tone="ink3" align="center">
                    {unit(key, n)}
                  </Text>
                </View>
              </React.Fragment>
            ))}
        </View>
      ) : null}

      {/* What they chose to keep. */}
      {picked.length > 0 ? (
        <View style={{paddingHorizontal: gutter, marginTop: 32}}>
          <SectionHead
            title={t('me.selections')}
            more={t('me.selectionsLink', {count: num(picked.length)})}
            onMore={goSelections}
          />
          {picked.slice(0, 2).map((note, i) => {
            const book = byId.get(note.book);
            // One run of text: a preview, not the page.
            const text = (note.content?.trim() || note.name).replace(
              /\s+/g,
              ' ',
            );
            const rtl = detectScript(text, 'arabic') === 'arabic';
            return (
              <Pressable
                key={note._id}
                onPress={() =>
                  navigation.navigate('note', {
                    bookId: note.book,
                    noteId: note._id,
                    note,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={[text, book?.name]
                  .filter(Boolean)
                  .join('، ')}
                style={({pressed}) => ({
                  paddingVertical: 14,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.rule2,
                  opacity: pressed ? 0.6 : 1,
                })}>
                <Text
                  role="excerpt"
                  align="natural"
                  numberOfLines={3}
                  style={{color: colors.ink}}>
                  {/* Bare spans: a nested Text would reset the paragraph's alignment on Android. */}
                  <RNText
                    style={{fontFamily: fonts.plex[400], color: colors.gold}}>
                    {rtl ? '«' : '“'}
                  </RNText>
                  {text}
                  <RNText
                    style={{fontFamily: fonts.plex[400], color: colors.gold}}>
                    {rtl ? '»' : '”'}
                  </RNText>
                </Text>
                <Text role="meta" tone="ink3" style={{marginTop: 6}}>
                  {book
                    ? `${isolate(coverTitle(book.name))} · ${t(
                        'book.pageMark',
                      )} ${num(note.page_number)}`
                    : `${t('book.pageMark')} ${num(note.page_number)}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : settled && bookcase.totals.notes > 0 && !selections.isPending ? (
        <View
          style={{
            marginHorizontal: gutter,
            marginTop: 28,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}>
          <Icon
            name="star"
            size={16}
            color={colors.gold}
            style={{marginTop: 3}}
          />
          <Text role="small" tone="ink3" style={{flex: 1}}>
            {t('harvest.starHint')}
          </Text>
        </View>
      ) : null}

      {/* Reading & appearance */}
      <SetHead>{t('me.reading')}</SetHead>
      <View style={{paddingHorizontal: gutter, gap: 22}}>
        <Pref icon="moon" label={t('me.theme')}>
          <Switcher
            accessibilityLabel={t('me.theme')}
            value={prefs.theme}
            onChange={v => setPref('theme', v)}
            options={[
              {
                value: 'system',
                label: `${t('me.themeSystem')}، ${t('me.themeSystemHint')}`,
                render: c => (
                  <IconLabel
                    icon="auto"
                    label={t('me.themeSystem')}
                    color={c}
                  />
                ),
              },
              {
                value: 'light',
                label: t('me.themeLight'),
                render: c => (
                  <IconLabel icon="sun" label={t('me.themeLight')} color={c} />
                ),
              },
              {
                value: 'dark',
                label: t('me.themeDark'),
                render: c => (
                  <IconLabel icon="moon" label={t('me.themeDark')} color={c} />
                ),
              },
            ]}
          />
        </Pref>
        <Pref glyph={t('me.sizeGlyph')} label={t('me.readingSize')}>
          <Switcher
            accessibilityLabel={t('me.readingSize')}
            value={prefs.readingSize}
            onChange={v => setPref('readingSize', v)}
            options={SIZES.map((size, i) => ({
              value: size,
              label: [
                t('me.sizeSmall'),
                t('me.sizeDefault'),
                t('me.sizeLarge'),
                t('me.sizeXL'),
              ][i],
              render: c => (
                <Glyph
                  text={t('me.sizeGlyph')}
                  size={GLYPH_SIZE[size]}
                  color={c}
                />
              ),
            }))}
          />
          <Text role="read" tone="ink2" align="natural" style={{marginTop: 12}}>
            {t('me.sizeSample')}
          </Text>
        </Pref>
        <Pref glyph="12" label={t('me.numerals')}>
          <Switcher
            accessibilityLabel={t('me.numerals')}
            value={prefs.numerals}
            onChange={v => setPref('numerals', v)}
            options={[
              // Spoken labels are built outside t(), which would re-style the digits.
              {
                value: 'latn',
                label: `${t('me.numerals')} 123`,
                render: c => <Plain text="123" color={c} />,
              },
              {
                value: 'arab',
                label: `${t('me.numerals')} ١٢٣`,
                render: c => <Plain text="١٢٣" color={c} />,
              },
            ]}
          />
        </Pref>
      </View>

      {/* Language: each option in its own script and face. */}
      <SetHead>{t('me.language')}</SetHead>
      <View style={{paddingHorizontal: gutter}}>
        <Switcher
          accessibilityLabel={t('me.language')}
          height={54}
          value={switching ?? lang}
          onChange={v => setSwitching(v)}
          options={[
            {
              value: 'ar',
              label: 'العربية',
              render: c => <Glyph text="العربية" size={20} color={c} arabic />,
            },
            {
              value: 'en',
              label: 'English',
              render: c => <Glyph text="English" size={18} color={c} />,
            },
          ]}
        />
        <Text role="meta" tone="ink3" style={{marginTop: 8}}>
          {t('me.languageNote')}
        </Text>
      </View>

      {/* Account: only what works. */}
      <SetHead>{t('me.account')}</SetHead>
      <View style={{paddingHorizontal: gutter}}>
        <Row icon="mail" label={email} latin />
        {verified ? (
          <Row icon="check" label={t('me.verified')} tone="ok" />
        ) : (
          <Row
            icon="check"
            label={t('me.verify')}
            onPress={() => navigation.navigate('verifyEmail', {from: 'me'})}
          />
        )}
        <Row
          icon="key"
          label={t('me.changePassword')}
          onPress={() => navigation.navigate('changePassword')}
        />
        <Button
          label={t('me.signOut')}
          icon="signOut"
          variant="line"
          block
          onPress={() => setConfirmSignOut(true)}
          style={{marginTop: 22, height: 50}}
        />
      </View>

      {__DEV__ && (
        <Pressable
          onPress={() => navigation.navigate('playground')}
          accessibilityRole="button"
          style={{marginTop: 22, alignSelf: 'center', padding: 8}}>
          <Text
            role="meta"
            tone="ink4"
            style={{textDecorationLine: 'underline'}}>
            {t('me.playground')}
          </Text>
        </Pressable>
      )}

      <Dialog
        visible={confirmSignOut}
        onClose={() => !signingOut && setConfirmSignOut(false)}>
        <Text role="display3" align="center">
          {t('me.signOutTitle')}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 8}}>
          {t('me.signOutBody')}
        </Text>
        <View style={{gap: 8, marginTop: 18}}>
          <Button
            label={signingOut ? t('auth.signingOut') : t('me.signOutConfirm')}
            block
            loading={signingOut}
            onPress={() => {
              // The session ends on the device whatever the server says; the
              // navigator then swaps to sign-in and this screen unmounts.
              setSigningOut(true);
              logout();
            }}
          />
          <Button
            label={t('common.cancel')}
            variant="line"
            block
            disabled={signingOut}
            onPress={() => setConfirmSignOut(false)}
            style={{borderWidth: 0}}
          />
        </View>
      </Dialog>

      <LanguageTransition
        to={switching}
        name={name || email || '·'}
        onShown={onLanguageShown}
      />
    </Screen>
  );
};

/** A settings group heading over a hairline (Settings board). */
const SetHead = ({children}: {children: string}) => {
  const {colors} = useTheme();
  return (
    <View
      style={{
        marginTop: 34,
        marginBottom: 14,
        marginHorizontal: gutter,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.rule,
      }}>
      <Text role="eyebrow" tone="ink3" accessibilityRole="header">
        {children}
      </Text>
    </View>
  );
};

/** A preference: icon or glyph, its name, then its switcher. */
const Pref = ({
  icon,
  glyph,
  label,
  children,
}: {
  icon?: IconName;
  glyph?: string;
  label: string;
  children: React.ReactNode;
}) => {
  const {colors} = useTheme();
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
        }}>
        <View style={{width: 22, alignItems: 'center'}}>
          {icon ? (
            <Icon name={icon} size={20} color={colors.ink2} />
          ) : (
            <Glyph
              text={glyph ?? ''}
              size={glyph && /\d/.test(glyph) ? 14 : 20}
              color={colors.ink2}
            />
          )}
        </View>
        <Text role="label">{label}</Text>
      </View>
      {children}
    </View>
  );
};

const Row = ({
  icon,
  label,
  onPress,
  latin,
  tone,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  latin?: boolean;
  tone?: 'ok';
}) => {
  const {colors} = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      style={({pressed}) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 54,
        borderBottomWidth: 1,
        borderBottomColor: colors.rule2,
        opacity: pressed ? 0.6 : 1,
      })}>
      <Icon
        name={icon}
        size={20}
        color={tone === 'ok' ? colors.ok : colors.ink2}
      />
      <Text
        role="label"
        script={latin ? 'latin' : undefined}
        color={tone === 'ok' ? colors.ok : undefined}
        numberOfLines={1}
        style={{flex: 1}}>
        {label}
      </Text>
      {onPress && <Icon name="forward" size={16} color={colors.ink4} />}
    </Pressable>
  );
};

const IconLabel = ({
  icon,
  label,
  color,
}: {
  icon: IconName;
  label: string;
  color: string;
}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
    <Icon name={icon} size={16} color={color} />
    <Text role="label" color={color} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

/** A label set in a reading face — a script sample rather than UI text. */
const Glyph = ({
  text,
  size,
  color,
  arabic,
}: {
  text: string;
  size: number;
  color: string;
  arabic?: boolean;
}) => {
  const ar = arabic ?? detectScript(text, 'latin') === 'arabic';
  return (
    <Text
      role="label"
      color={color}
      script={ar ? 'arabic' : 'latin'}
      style={{
        fontFamily: ar ? fonts.thmanyah[500] : fonts.newsreader[500],
        fontSize: ar ? Math.round(size * AR_SERIF * 1.05) : size,
        lineHeight: size * 1.3,
      }}>
      {text}
    </Text>
  );
};

const Plain = ({text, color}: {text: string; color: string}) => (
  <Text
    role="label"
    color={color}
    style={{fontFamily: fonts.plex[500], fontSize: 16, lineHeight: 22}}>
    {text}
  </Text>
);
