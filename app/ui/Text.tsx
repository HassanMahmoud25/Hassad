import React from 'react';
import {I18nManager, StyleSheet, Text as RNText, TextProps as RNTextProps, TextStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {AR_SERIF, fonts, MAX_FONT_SCALE, TextRole, typeSpec} from '../theme/type';
import {childrenToText, detectScript, Script} from '../lib/text';
import {uiScript} from '../lib/locale';
import {Palette} from '../theme/tokens';

type Tone = 'ink' | 'ink2' | 'ink3' | 'ink4' | 'gold' | 'danger' | 'onInk' | 'ok';

export interface TextProps extends Omit<RNTextProps, 'role'> {
  /** Type role (not the ARIA role; use accessibilityRole for that). */
  role?: TextRole;
  tone?: Tone;
  /** Overrides script detection, e.g. for a title whose script is known. */
  script?: Script;
  /**
   * start/end follow the UI direction. `natural` aligns to the text's own
   * script — use it for reading paragraphs, where each paragraph keeps its
   * own direction (Design Lock v2 §13).
   */
  align?: 'start' | 'end' | 'center' | 'natural';
  color?: string;
}

const BALANCED: ReadonlySet<TextRole> = new Set<TextRole>(['hero', 'display1', 'display2', 'display3', 'title']);

const toneColor = (tone: Tone, c: Palette) =>
  ({ink: c.ink, ink2: c.ink2, ink3: c.ink3, ink4: c.ink4, gold: c.goldInk, danger: c.danger, onInk: c.onInk, ok: c.ok})[tone];

/**
 * The only text component in the new UI. Picks the reading face (Thmanyah Serif for
 * Arabic, Newsreader for Latin) from the content itself for content roles,
 * and Plex Arabic for interface roles.
 */
export const Text = ({role = 'body', tone = 'ink', script, align = 'start', color, style, children, ...rest}: TextProps) => {
  const {colors, readingScale} = useTheme();
  const ui = uiScript();
  const content = script ?? detectScript(childrenToText(children), ui);
  const spec = typeSpec(role, content, ui, readingScale);

  // React Native maps textAlign 'left' to the start edge and 'right' to the
  // end edge in RTL layouts (both platforms), so start/end are left/right.
  let textAlign: TextStyle['textAlign'];
  if (align === 'center') {
    textAlign = 'center';
  } else if (align === 'end') {
    textAlign = 'right';
  } else if (align === 'natural') {
    const contentIsRTL = content === 'arabic';
    textAlign = contentIsRTL === I18nManager.isRTL ? 'left' : 'right';
  } else {
    textAlign = 'left';
  }

  // Screens tune a role's size in Latin-equivalent points (`fontSize: 18` on a
  // title). In Thmanyah, which draws larger, the same tuning scales down so a
  // tuned title keeps its optical size in both scripts.
  let tuned = style;
  if (spec.fontFamily === fonts.thmanyah[400] || spec.fontFamily === fonts.thmanyah[500]) {
    const flat = StyleSheet.flatten(style);
    if (flat?.fontSize && !flat.fontFamily) {
      tuned = [style, flat.lineHeight ? {fontSize: flat.fontSize * AR_SERIF, lineHeight: flat.lineHeight * 0.95} : {fontSize: flat.fontSize * AR_SERIF}];
    }
  }

  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SCALE[role] ?? 1.5}
      // Headings and centred lines break evenly instead of leaving an orphan word
      // (Android; iOS already balances short headings well).
      textBreakStrategy={BALANCED.has(role) || align === 'center' ? 'balanced' : 'highQuality'}
      {...rest}
      style={[
        spec,
        {color: color ?? toneColor(tone, colors), textAlign, writingDirection: content === 'arabic' ? 'rtl' : 'ltr'},
        tuned,
      ]}>
      {children}
    </RNText>
  );
};
