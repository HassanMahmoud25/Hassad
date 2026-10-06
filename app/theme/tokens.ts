// Hassad 2.0 design tokens — Design Lock v2.
// Light is "Paper", dark is "Night library". Each theme is tuned on its own;
// nothing is derived by inverting the other.

export type ThemeName = 'light' | 'dark';

export interface Palette {
  paper: string; // canvas
  paper2: string; // sunken: chips, segmented tracks
  paper3: string; // deeper sunken, plank top
  card: string; // raised surfaces, the Book "page"
  cardHi: string;
  ink: string; // text, primary buttons
  ink2: string; // secondary text
  ink3: string; // metadata — the lightest allowed text colour
  ink4: string; // placeholders, disabled
  rule: string; // hairlines
  rule2: string; // faint hairlines
  gold: string; // marks and ornaments only
  goldInk: string; // gold used as text (page numbers, eyebrows)
  goldSoft: string;
  goldWash: string;
  foil: string; // foil titles on dark bindings
  danger: string;
  dangerWash: string;
  ok: string;
  onInk: string; // text on ink buttons
  glass: string; // floating chrome fill
  glassStrong: string; // sheets
  glassLine: string;
  scrim: string;
  skeleton: string;
  plankTop: string;
  plankBottom: string;
  shadow: string; // base shadow colour
}

export const palettes: Record<ThemeName, Palette> = {
  light: {
    paper: '#F7F4EE',
    paper2: '#EEE9E0',
    paper3: '#E3DCCF',
    card: '#FDFBF7',
    cardHi: '#FFFFFF',
    ink: '#1C1915',
    ink2: '#544D43',
    ink3: '#6B6255',
    ink4: '#A0968A',
    rule: 'rgba(28,25,21,0.13)',
    rule2: 'rgba(28,25,21,0.07)',
    gold: '#B3863A',
    goldInk: '#875C1A',
    goldSoft: '#EBDDBD',
    goldWash: 'rgba(179,134,58,0.12)',
    foil: '#E2C68C',
    danger: '#9A2D25',
    dangerWash: 'rgba(154,45,37,0.09)',
    ok: '#3F5B41',
    onInk: '#F7F2E9',
    glass: 'rgba(252,250,246,0.66)',
    glassStrong: 'rgba(252,250,246,0.94)',
    glassLine: 'rgba(255,255,255,0.75)',
    scrim: 'rgba(30,23,14,0.34)',
    skeleton: '#EAE4D9',
    plankTop: '#E3DCCF',
    plankBottom: '#EEE9E0',
    shadow: '#3A280E',
  },
  dark: {
    paper: '#13110E',
    paper2: '#1B1814',
    paper3: '#24201A',
    card: '#1D1A16',
    cardHi: '#26221C',
    ink: '#EEE7DA',
    ink2: '#BFB5A5',
    ink3: '#978D7E',
    ink4: '#685F54',
    rule: 'rgba(238,231,218,0.13)',
    rule2: 'rgba(238,231,218,0.06)',
    gold: '#CFA65A',
    goldInk: '#D9B46C',
    goldSoft: '#3A2F1C',
    goldWash: 'rgba(207,166,90,0.13)',
    foil: '#E2C68C',
    danger: '#E3887C',
    dangerWash: 'rgba(227,136,124,0.10)',
    ok: '#A3C09E',
    onInk: '#16130F',
    glass: 'rgba(34,30,25,0.56)',
    glassStrong: 'rgba(30,27,23,0.96)',
    glassLine: 'rgba(255,255,255,0.08)',
    scrim: 'rgba(0,0,0,0.52)',
    skeleton: '#26221C',
    plankTop: '#2C2721',
    plankBottom: '#211D18',
    shadow: '#000000',
  },
};

// ── Bindings: the cloth colours of designed covers ─────────────────────────
export type BindingId =
  | 'oxblood' | 'forest' | 'indigo' | 'clay' | 'slate' | 'teal' | 'plum' | 'ink' | 'terra'
  | 'night' | 'olive' | 'bone' | 'sand' | 'saffron' | 'sage' | 'blush' | 'cream' | 'sky';

export interface Binding {
  id: BindingId;
  cloth: string;
  /** Title colour on this cloth: foil on dark cloth, ink on light cloth. */
  text: string;
  light: boolean;
}

const FOIL = '#E2C68C';
const DARK_TEXT = '#2A2219';

export const bindings: Binding[] = [
  {id: 'oxblood', cloth: '#6B2A25', text: FOIL, light: false},
  {id: 'forest', cloth: '#2E4534', text: FOIL, light: false},
  {id: 'indigo', cloth: '#25304A', text: FOIL, light: false},
  {id: 'clay', cloth: '#8B4C34', text: FOIL, light: false},
  {id: 'slate', cloth: '#38454A', text: FOIL, light: false},
  {id: 'teal', cloth: '#1F4846', text: FOIL, light: false},
  {id: 'plum', cloth: '#4A2E3B', text: FOIL, light: false},
  {id: 'ink', cloth: '#1F3A5F', text: FOIL, light: false},
  {id: 'terra', cloth: '#B85C3C', text: '#FBEBDC', light: false},
  {id: 'night', cloth: '#1D1C21', text: '#EEE7DA', light: false},
  {id: 'olive', cloth: '#5F5E35', text: FOIL, light: false},
  {id: 'bone', cloth: '#E5DAC4', text: DARK_TEXT, light: true},
  {id: 'sand', cloth: '#CDB68C', text: DARK_TEXT, light: true},
  {id: 'saffron', cloth: '#E2A93E', text: DARK_TEXT, light: true},
  {id: 'sage', cloth: '#A9B89C', text: '#22261E', light: true},
  {id: 'blush', cloth: '#E7C7BA', text: '#3A1E18', light: true},
  {id: 'cream', cloth: '#F0E6D3', text: '#5A221E', light: true},
  {id: 'sky', cloth: '#86A9C4', text: '#14263A', light: true},
];

export const bindingById = (id: BindingId): Binding =>
  bindings.find(b => b.id === id) ?? bindings[0];

// ── Colour maths (hex only) ────────────────────────────────────────────────
const toRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const toHex = (rgb: number[]) =>
  '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** Mixes `a` toward `b` by `t` (0 = a, 1 = b). */
export const mix = (a: string, b: string, t: number): string => {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};

export const withAlpha = (hex: string, alpha: number): string => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
};

/** The Book header tint for a binding: a pastel of the cloth on Paper, the
 * cloth itself deepened on Night. */
export const bookTint = (cloth: string, theme: ThemeName) => {
  if (theme === 'light') {
    // The glow is light behind the book, never a film of the cloth: a dark
    // binding at low alpha greys the paper into a smudge.
    return {top: mix(cloth, palettes.light.paper, 0.85), mid: mix(cloth, palettes.light.paper, 0.93), glow: 'rgba(255,250,240,0.85)'};
  }
  // Light cloths (bone, cream, sky…) would deepen to a grey haze; take them
  // further toward night so the header stays a binding colour.
  const pale = luminance(cloth) > 0.4;
  return {top: mix(cloth, '#000000', pale ? 0.66 : 0.42), mid: mix(cloth, '#000000', pale ? 0.8 : 0.68), glow: 'rgba(226,180,120,0.16)'};
};

/** Relative luminance (0–1) of a hex colour. */
export const luminance = (hex: string): number => {
  const [r, g, b] = toRgb(hex).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// ── Note ribbons ↔ the API's five stored colours ───────────────────────────
// The backend validates `color` against exactly these values (hasad-BE
// config/colors.js). The app keeps sending them and shows them as ribbons.
export const NOTE_COLORS = ['#F7F7D3', '#D7F6E5', '#DBE9FE', '#F7DEE4', '#EFE9F5'] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];
export const DEFAULT_NOTE_COLOR: NoteColor = '#DBE9FE';

export const ribbons: Record<NoteColor, {name: string; ribbon: string}> = {
  '#F7F7D3': {name: 'wheat', ribbon: '#C29A47'},
  '#D7F6E5': {name: 'sage', ribbon: '#7D9879'},
  '#DBE9FE': {name: 'blue', ribbon: '#5E7BA0'},
  '#F7DEE4': {name: 'clay', ribbon: '#B66E59'},
  '#EFE9F5': {name: 'dusk', ribbon: '#8A7CA0'},
};

/** Ribbon colour for whatever the API returned, tolerating values written by
 * the old client before validation existed. */
export const ribbonFor = (color?: string): string => {
  const key = (color ?? '').toUpperCase() as NoteColor;
  return (ribbons[key] ?? ribbons[DEFAULT_NOTE_COLOR]).ribbon;
};

// ── Shape & space ──────────────────────────────────────────────────────────
export const space = {xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40} as const;

export const radius = {
  bookFore: 7, // book fore-edge
  bookSpine: 3, // book spine side
  chip: 17,
  input: 16,
  panel: 24,
  sheet: 34,
  pill: 999,
} as const;

export const gutter = 20; // screen side padding
