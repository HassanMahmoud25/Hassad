import {TextStyle} from 'react-native';
import {Script} from '../lib/text';

// Bundled faces (app/assets/fonts). File names equal PostScript names, so the
// same string works as `fontFamily` on iOS and Android. Weight is chosen by
// family name, never by `fontWeight`, which Android ignores for custom fonts.
// Thmanyah (خط ثمانية) is licensed for embedding only; its files are not
// committed — see app/assets/fonts/README.md.
export const fonts = {
  thmanyah: {400: 'thmanyahseriftext-Regular', 500: 'thmanyahseriftext-Medium'},
  newsreader: {400: 'Newsreader-Regular', 500: 'Newsreader-Medium', italic: 'Newsreader-Italic'},
  plex: {400: 'IBMPlexSansArabic-Regular', 500: 'IBMPlexSansArabic-Medium', 600: 'IBMPlexSansArabic-SemiBold'},
} as const;

/** Content roles take the reading faces; interface roles take Plex Arabic,
 * which carries Latin too. */
export type ContentRole =
  | 'hero' // onboarding
  | 'display1' // root screen titles
  | 'display2' // book hero title
  | 'display3' // sheet titles, empty-state headings
  | 'title' // note titles in lists
  | 'read' // note body
  | 'excerpt' // note preview in lists
  | 'coverTitle'; // reserved: cover type is sized by the Cover component

export type UIRole = 'body' | 'small' | 'label' | 'meta' | 'eyebrow' | 'button' | 'tab' | 'numeral';

export type TextRole = ContentRole | UIRole;

export const CONTENT_ROLES: ReadonlySet<TextRole> = new Set<TextRole>([
  'hero', 'display1', 'display2', 'display3', 'title', 'read', 'excerpt', 'coverTitle',
]);

type Spec = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'textTransform' | 'fontStyle'>;

/** Thmanyah Serif Text draws about 1.3× larger than its point size suggests
 * beside Plex and Newsreader (taller alef, wider bowls). Arabic serif sizes
 * set outside the role table scale by this to keep the same optical size. */
export const AR_SERIF = 0.8;

// Design Lock v2 §04, re-set for Thmanyah Serif Text: display roles at 0.8 of
// the Markazi sizes, reading roles at ~0.86 so long text stays comfortable;
// Medium carries every heading. Arabic is never letter-spaced.
const arabic: Record<TextRole, Spec> = {
  hero: {fontFamily: fonts.thmanyah[500], fontSize: 37, lineHeight: 48},
  display1: {fontFamily: fonts.thmanyah[500], fontSize: 31, lineHeight: 41},
  display2: {fontFamily: fonts.thmanyah[500], fontSize: 23.5, lineHeight: 33},
  display3: {fontFamily: fonts.thmanyah[500], fontSize: 18.5, lineHeight: 28},
  title: {fontFamily: fonts.thmanyah[500], fontSize: 16.5, lineHeight: 25},
  read: {fontFamily: fonts.thmanyah[400], fontSize: 18, lineHeight: 34},
  excerpt: {fontFamily: fonts.thmanyah[400], fontSize: 15.5, lineHeight: 26},
  coverTitle: {fontFamily: fonts.thmanyah[500], fontSize: 16, lineHeight: 21},
  body: {fontFamily: fonts.plex[400], fontSize: 15, lineHeight: 25},
  small: {fontFamily: fonts.plex[400], fontSize: 13.5, lineHeight: 21},
  label: {fontFamily: fonts.plex[500], fontSize: 13, lineHeight: 19},
  meta: {fontFamily: fonts.plex[500], fontSize: 12, lineHeight: 18},
  eyebrow: {fontFamily: fonts.plex[600], fontSize: 12.5, lineHeight: 17},
  button: {fontFamily: fonts.plex[600], fontSize: 15, lineHeight: 20},
  tab: {fontFamily: fonts.plex[500], fontSize: 10.5, lineHeight: 14},
  numeral: {fontFamily: fonts.thmanyah[500], fontSize: 18, lineHeight: 24},
};

const latin: Record<TextRole, Spec> = {
  hero: {fontFamily: fonts.newsreader[400], fontSize: 42, lineHeight: 44, letterSpacing: -0.84},
  display1: {fontFamily: fonts.newsreader[400], fontSize: 34, lineHeight: 37, letterSpacing: -0.6},
  display2: {fontFamily: fonts.newsreader[500], fontSize: 26, lineHeight: 30, letterSpacing: -0.3},
  display3: {fontFamily: fonts.newsreader[500], fontSize: 21, lineHeight: 26},
  title: {fontFamily: fonts.newsreader[500], fontSize: 18.5, lineHeight: 24},
  read: {fontFamily: fonts.newsreader[400], fontSize: 18.5, lineHeight: 30},
  excerpt: {fontFamily: fonts.newsreader[400], fontSize: 15.5, lineHeight: 23},
  coverTitle: {fontFamily: fonts.newsreader[500], fontSize: 18, lineHeight: 20},
  body: {fontFamily: fonts.plex[400], fontSize: 15, lineHeight: 24},
  small: {fontFamily: fonts.plex[400], fontSize: 13.5, lineHeight: 20},
  label: {fontFamily: fonts.plex[500], fontSize: 13, lineHeight: 18},
  meta: {fontFamily: fonts.plex[500], fontSize: 12, lineHeight: 17},
  eyebrow: {fontFamily: fonts.plex[600], fontSize: 10.5, lineHeight: 14, letterSpacing: 1.5, textTransform: 'uppercase'},
  button: {fontFamily: fonts.plex[600], fontSize: 15, lineHeight: 20},
  tab: {fontFamily: fonts.plex[500], fontSize: 10.5, lineHeight: 14},
  numeral: {fontFamily: fonts.newsreader[500], fontSize: 22, lineHeight: 24},
};

export type ReadingSize = 'small' | 'default' | 'large' | 'xlarge';
export const READING_SCALE: Record<ReadingSize, number> = {small: 0.9, default: 1, large: 1.14, xlarge: 1.3};

/** Resolves a role for a script. UI roles use the UI language's table so an
 * English label in the Arabic UI keeps Arabic metrics (and no tracking);
 * content roles use the content's own script. */
export const typeSpec = (role: TextRole, contentScript: Script, uiScript: Script, readingScale = 1): Spec => {
  const table = CONTENT_ROLES.has(role) ? (contentScript === 'arabic' ? arabic : latin) : uiScript === 'arabic' ? arabic : latin;
  const spec = table[role];
  if ((role === 'read' || role === 'excerpt') && readingScale !== 1) {
    return {...spec, fontSize: (spec.fontSize ?? 15) * readingScale, lineHeight: (spec.lineHeight ?? 20) * readingScale};
  }
  return spec;
};

/** Display roles may grow with Dynamic Type, but not without limit. */
export const MAX_FONT_SCALE: Partial<Record<TextRole, number>> = {
  hero: 1.2, display1: 1.25, display2: 1.3, display3: 1.3, tab: 1.2, eyebrow: 1.3, coverTitle: 1,
};
