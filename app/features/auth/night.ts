import {palettes} from '../../theme/tokens';

// Onboarding and the auth headers always sit "at night" (Design Lock v2:
// onboarding is four chapters at night): the Night library palette, whatever
// the reader's theme. The form sheets below follow the theme.
export const night = {
  bg: palettes.dark.paper,
  ink: palettes.dark.ink,
  ink2: palettes.dark.ink2,
  ink3: palettes.dark.ink3,
  gold: palettes.dark.goldInk,
  rule: palettes.dark.rule,
  cream: palettes.dark.ink, // the cream used for night buttons
  onCream: palettes.dark.onInk,
};
