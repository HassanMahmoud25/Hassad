import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {Animated, Easing, I18nManager, PanResponder, Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, Ellipse, Line, RadialGradient, Rect, Stop} from 'react-native-svg';
import {FixedTheme, useTheme} from '../../theme/ThemeProvider';
import {gutter, palettes} from '../../theme/tokens';
import {useT} from '../../lib/i18n';
import {useReduceMotion} from '../../lib/a11y';
import {currentLang} from '../../lib/locale';
import {completeOnboarding} from '../../lib/onboarding';
import {RootStackParamList} from '../../navigation/types';
import {Button, Cover, Icon, Plank, Ribbon, Spine, Text, WheatSeal} from '../../ui';

type Props = NativeStackScreenProps<RootStackParamList, 'onboarding'>;

const CHAPTERS = 4;

/**
 * Four short chapters at night (Design Lock v2): what stays after reading,
 * harvesting a note, gathering it on shelves, and the library that becomes
 * «حصادك». Seen once per install; the last chapter leads into an account.
 */
export const OnboardingScreen = (props: Props) => (
  <FixedTheme name="dark">
    <Onboarding {...props} />
  </FixedTheme>
);

const Onboarding = ({navigation}: Props) => {
  const {colors} = useTheme();
  const {t, num} = useT();
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const reduce = useReduceMotion();
  const [page, setPage] = useState(0);
  const last = page === CHAPTERS - 1;
  const artH = Math.min(320, Math.round(height * 0.38));

  // A small pager of our own: the chapters sit in a row in reading order
  // (right to left in Arabic), and the row slides by whole widths.
  // Physical offset: chapters advance leftwards in English, rightwards in Arabic.
  const dir = I18nManager.isRTL ? 1 : -1;
  const x = useRef(new Animated.Value(0)).current;
  const pageRef = useRef(0);
  const go = (i: number) => {
    const to = Math.max(0, Math.min(CHAPTERS - 1, i));
    pageRef.current = to;
    setPage(to);
    const value = dir * to * width;
    if (reduce) {
      x.setValue(value);
    } else {
      Animated.spring(x, {toValue: value, useNativeDriver: true, damping: 26, stiffness: 220, mass: 1}).start();
    }
  };
  const goRef = useRef(go);
  goRef.current = go;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_, g) => {
        const p = pageRef.current;
        // Resist past the first and last chapter.
        const forward = g.dx * dir > 0 ? 1 : -1;
        const atEdge = (p === 0 && forward < 0) || (p === CHAPTERS - 1 && forward > 0);
        x.setValue(dir * p * width + g.dx * (atEdge ? 0.25 : 1));
      },
      onPanResponderRelease: (_, g) => {
        const p = pageRef.current;
        // The row moves by `dir` per chapter, so a drag along `dir` heads to the next one.
        const moved = g.dx * dir;
        const fling = g.vx * dir;
        const step = moved > width * 0.18 || fling > 0.45 ? 1 : moved < -width * 0.18 || fling < -0.45 ? -1 : 0;
        goRef.current(p + step);
      },
      onPanResponderTerminate: () => goRef.current(pageRef.current),
    }),
  ).current;
  const finish = (to: 'signUp' | 'signIn') => {
    completeOnboarding();
    navigation.replace(to);
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.paper}}>
      <Glow width={width} height={height} />
      <View style={{paddingTop: insets.top + 10, paddingHorizontal: gutter, flexDirection: 'row', alignItems: 'center', height: insets.top + 10 + 44}}>
        <Text role="eyebrow" tone="gold" style={{flex: 1}} accessibilityLabel={t('onboarding.chapter', {n: page + 1, total: CHAPTERS})}>
          {t('onboarding.chapter', {n: num(page + 1), total: num(CHAPTERS)})}
        </Text>
        {!last ? (
          <Pressable onPress={() => go(CHAPTERS - 1)} accessibilityRole="button" hitSlop={12} style={{minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end'}}>
            <Text role="label" tone="ink2">
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{flex: 1, overflow: 'hidden'}} {...pan.panHandlers}>
        <Animated.View style={{position: 'absolute', top: 0, bottom: 0, start: 0, width: width * CHAPTERS, flexDirection: 'row', transform: [{translateX: x}]}}>
          {Array.from({length: CHAPTERS}, (_, i) => (
            <View key={i} style={{width}} importantForAccessibility={page === i ? 'auto' : 'no-hide-descendants'} accessibilityElementsHidden={page !== i}>
              <Chapter active={page === i} art={<Art index={i} height={artH} width={width - gutter * 2} />} title={t(`onboarding.t${i + 1}`)} body={t(`onboarding.b${i + 1}`)} />
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={{paddingHorizontal: gutter, paddingBottom: insets.bottom + 18, paddingTop: 8}}>
        {last ? (
          <View style={{gap: 6}}>
            <Button label={t('onboarding.start')} block onPress={() => finish('signUp')} style={{height: 56, borderRadius: 28}} />
            <Pressable onPress={() => finish('signIn')} accessibilityRole="button" style={({pressed}) => ({minHeight: 48, flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center', opacity: pressed ? 0.6 : 1})}>
              <Text role="label" tone="ink3">
                {t('onboarding.haveAccount')}
              </Text>
              <Text role="label" style={{textDecorationLine: 'underline'}}>
                {t('onboarding.signIn')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 110}}>
            <Dashes page={page} />
            <Pressable
              onPress={() => go(page + 1)}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.next')}
              style={({pressed}) => ({width: 60, height: 60, borderRadius: 30, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', transform: [{scale: pressed ? 0.95 : 1}]})}>
              <Icon name="arrowNext" size={24} color={colors.onInk} strokeWidth={1.8} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

/** Progress as four dashes; the current chapter is the long gold one. */
const Dashes = ({page}: {page: number}) => {
  const {colors} = useTheme();
  return (
    <View style={{flexDirection: 'row', gap: 6}} importantForAccessibility="no-hide-descendants">
      {Array.from({length: CHAPTERS}, (_, i) => (
        <View key={i} style={{height: 3, borderRadius: 2, width: i === page ? 26 : 10, backgroundColor: i === page ? colors.goldInk : i < page ? colors.ink3 : colors.rule}} />
      ))}
    </View>
  );
};

/** One chapter: the drawing, then the line and its sentence, rising in. */
const Chapter = ({active, art, title, body}: {active: boolean; art: ReactNode; title: string; body: string}) => {
  const reduce = useReduceMotion();
  const enter = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    if (!active) {
      enter.setValue(reduce ? 1 : 0);
      return;
    }
    if (reduce) {
      enter.setValue(1);
      return;
    }
    Animated.timing(enter, {toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true}).start();
  }, [active, reduce, enter]);
  const rise = (from: number, delay: number) => ({
    opacity: enter.interpolate({inputRange: [delay, 1], outputRange: [0, 1], extrapolate: 'clamp'}),
    transform: [{translateY: enter.interpolate({inputRange: [delay, 1], outputRange: [from, 0], extrapolate: 'clamp'})}],
  });
  return (
    <View style={{flex: 1, paddingHorizontal: gutter, justifyContent: 'flex-end'}}>
      <Animated.View style={[{flex: 1, alignItems: 'center', justifyContent: 'center'}, rise(14, 0)]} importantForAccessibility="no-hide-descendants">
        {art}
      </Animated.View>
      <Animated.View style={[{paddingTop: 12}, rise(10, 0.25)]}>
        <Text role="hero" accessibilityRole="header">
          {title}
        </Text>
        <Text role="body" tone="ink2" style={{marginTop: 10, fontSize: 16, lineHeight: 26}}>
          {body}
        </Text>
      </Animated.View>
    </View>
  );
};

const Glow = ({width, height}: {width: number; height: number}) => (
  <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
    <Defs>
      <RadialGradient id="ob-glow" cx="50%" cy="50%" rx="50%" ry="50%">
        <Stop offset="0" stopColor="#E2B478" stopOpacity={0.16} />
        <Stop offset="1" stopColor="#E2B478" stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Ellipse cx={width / 2} cy={height * 0.32} rx={width * 0.85} ry={height * 0.3} fill="url(#ob-glow)" />
  </Svg>
);

// ——— Illustrations, drawn with the app's own book objects ———

// Real titles, chosen to match the language of the chapter's sentences.
const SHELF = {
  ar: ['الأيام', 'كليلة ودمنة', 'طوق الحمامة', 'مقدمة ابن خلدون', 'البخلاء', 'رسالة الغفران', 'الإمتاع والمؤانسة'],
  en: ['Middlemarch', 'Meditations', 'Walden', 'Thinking, Fast and Slow', 'The Odyssey', 'Moby-Dick', 'Essays'],
};
const HEROES = {ar: 'مقدمة ابن خلدون', en: 'Thinking, Fast and Slow'};
const PAGE = {ar: 97, en: 85};

const Art = ({index, width, height}: {index: number; width: number; height: number}) => {
  const l = currentLang() === 'ar' ? 'ar' : 'en';
  if (index === 0) {
    return <Remains titles={SHELF[l]} width={width} height={height} />;
  }
  if (index === 1) {
    return <Harvest book={HEROES[l]} page={PAGE[l]} height={height} />;
  }
  if (index === 2) {
    return <Gather titles={SHELF[l]} width={width} height={height} />;
  }
  return <Bookplate height={height} />;
};

/** A paper slip with a note on it — content on paper, even at night. */
const Slip = ({book, page, w = 236, ribbon, children}: {book?: string; page?: number; w?: number; ribbon?: boolean; children?: ReactNode}) => {
  const {t, num} = useT();
  const p = palettes.light;
  return (
    <View style={{width: w, backgroundColor: p.card, borderRadius: 14, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, boxShadow: '0px 18px 34px -14px rgba(0,0,0,0.75)'}}>
      {ribbon ? (
        <View style={{position: 'absolute', top: -1, end: 18}}>
          <Ribbon color="#9A3B2E" width={12} height={22} />
        </View>
      ) : null}
      <Text role="title" color={p.ink} style={{paddingEnd: ribbon ? 18 : 0}}>
        {t('onboarding.noteTitle')}
      </Text>
      <Text role="excerpt" color={p.ink2} style={{marginTop: 4}} numberOfLines={4}>
        {t('onboarding.noteBody')}
      </Text>
      {book ? (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10}}>
          <View style={{height: StyleSheet.hairlineWidth, width: 14, backgroundColor: p.goldInk}} />
          <Text role="meta" color={p.goldInk} numberOfLines={2} style={{flexShrink: 1}}>
            {book}
            {/* The page mark and its number never part across lines. */}
            {page ? ` · ${t('book.pageMark')}\u00A0${num(page)}` : ''}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
};

/** I. Many pages, a few lines: a full shelf, and one slip rising out of it. */
const Remains = ({titles, width, height}: {titles: string[]; width: number; height: number}) => {
  const spineH = Math.round(height * 0.5);
  const widths = [30, 26, 34, 38, 24, 30, 28];
  const lean = 5;
  return (
    <View style={{width: Math.min(width, 320), height, justifyContent: 'flex-end'}}>
      <View style={{position: 'absolute', top: 0, alignSelf: 'center', transform: [{rotate: '-4deg'}]}}>
        <PaperLines />
      </View>
      <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3, paddingHorizontal: 18}}>
        {titles.map((title, i) => (
          <View key={title} style={i === lean ? {transform: [{rotate: '7deg'}], marginStart: 6} : undefined}>
            <Spine seed={title} title={title} height={spineH - (i % 3) * 14} width={widths[i]} />
          </View>
        ))}
      </View>
      <Plank style={{marginHorizontal: 0}} />
    </View>
  );
};

/** The slip of chapter I, as ruled lines: what stays, not yet written. */
const PaperLines = () => {
  const p = palettes.light;
  return (
    <View style={{width: 172, height: 112, backgroundColor: p.card, borderRadius: 12, padding: 18, boxShadow: '0px 18px 34px -14px rgba(0,0,0,0.75)'}}>
      <Svg width={136} height={76}>
        {[0, 1, 2, 3].map(i => (
          <Line key={i} x1={0} x2={i === 3 ? 72 : 136} y1={10 + i * 20} y2={10 + i * 20} stroke={i === 0 ? p.goldInk : p.rule2} strokeWidth={i === 0 ? 2 : 1.4} strokeLinecap="round" />
        ))}
      </Svg>
    </View>
  );
};

/** II. The book open on the moment: its cover, and the note taken from it. */
const Harvest = ({book, page, height}: {book: string; page: number; height: number}) => {
  const coverW = Math.round(height * 0.42);
  // Side by side, barely touching: the cover's title stays readable.
  return (
    <View style={{height, width: 330}}>
      <View style={{position: 'absolute', top: height * 0.06, start: 10, transform: [{rotate: I18nManager.isRTL ? '5deg' : '-5deg'}]}}>
        <Cover title={book} width={coverW} shadow="hero" composition="framed" binding="oxblood" decorative />
      </View>
      <View style={{position: 'absolute', bottom: height * 0.04, end: 0, transform: [{rotate: I18nManager.isRTL ? '-3deg' : '3deg'}]}}>
        <Slip book={book} page={page} w={216} />
      </View>
    </View>
  );
};

/** III. Books on two shelves, and the chosen note marked with a ribbon. */
const Gather = ({titles, width, height}: {titles: string[]; width: number; height: number}) => {
  const {t} = useT();
  const shelfW = Math.min(width, 320);
  const spineH = Math.round(height * 0.22);
  const row = (items: string[], key: string) => (
    <View key={key}>
      <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3}}>
        {items.map((title, i) => (
          <Spine key={title} seed={title} title={title} height={spineH - (i % 3) * 10} width={20 + ((i * 7) % 12)} />
        ))}
      </View>
      <Plank style={{marginHorizontal: 0}} />
    </View>
  );
  // The upper shelf in full; the chosen note leans on the lower one.
  return (
    <View style={{width: shelfW, height, justifyContent: 'flex-start', paddingTop: height * 0.04}}>
      <View style={{gap: 22, opacity: 0.92}}>
        {row(titles, 'a')}
        {row([...titles].reverse().slice(1, 7), 'b')}
      </View>
      <View style={{position: 'absolute', start: shelfW * 0.12, bottom: -height * 0.04, transform: [{rotate: I18nManager.isRTL ? '-2deg' : '2deg'}]}}>
        <Slip w={210} ribbon>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10}}>
            <Icon name="star" size={13} color={palettes.light.goldInk} />
            <Text role="meta" color={palettes.light.goldInk}>
              {t('onboarding.inSelections')}
            </Text>
          </View>
        </Slip>
      </View>
    </View>
  );
};

/** IV. An ex-libris plate: the library is now the reader's own «حصادك». */
const Bookplate = ({height}: {height: number}) => {
  const {t} = useT();
  const p = palettes.light;
  const w = Math.min(232, Math.round(height * 0.74));
  const h = Math.round(w * 1.3);
  return (
    <View style={{height, alignItems: 'center', justifyContent: 'center'}}>
      <View style={{width: w, height: h, backgroundColor: p.card, borderRadius: 6, boxShadow: '0px 24px 44px -18px rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center'}}>
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Rect x={10} y={10} width={w - 20} height={h - 20} rx={3} fill="none" stroke={p.goldInk} strokeWidth={1.2} />
          <Rect x={15} y={15} width={w - 30} height={h - 30} rx={2} fill="none" stroke={p.goldInk} strokeWidth={0.6} opacity={0.6} />
        </Svg>
        <Text role="eyebrow" color={p.goldInk} align="center">
          {t('onboarding.exLibris')}
        </Text>
        <Text role="display1" color={p.ink} align="center" style={{marginTop: 6}}>
          {t('onboarding.yours')}
        </Text>
        <View style={{height: StyleSheet.hairlineWidth, width: 46, backgroundColor: p.goldInk, marginVertical: 14}} />
        <WheatSeal size={58} />
      </View>
    </View>
  );
};
