# Fonts

| Face | Use | Source |
| --- | --- | --- |
| Thmanyah Serif Text (Regular, Medium) | Arabic headings and reading text | Official Thmanyah fonts site (not committed) |
| IBM Plex Sans Arabic (Regular, Medium, SemiBold) | Interface text, both languages | Open Font License |
| Newsreader (Regular, Medium, Italic) | English headings and reading text | Open Font License |

## Thmanyah

The Thmanyah licence allows embedding the fonts in a compiled app but forbids
redistributing, hosting or sharing the font files. This repository is public,
so the files are git-ignored. To build:

1. Download the Thmanyah fonts from the official Thmanyah site.
2. Copy the Serif Text faces here under their PostScript names:
   - `thmanyahseriftext-Regular.otf`
   - `thmanyahseriftext-Medium.otf`
3. Run `npx react-native-asset` to copy them into the Android and iOS projects.

The `fontFamily` strings in `app/theme/type.ts` are these PostScript names.
