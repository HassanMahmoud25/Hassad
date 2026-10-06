import React from 'react';
import {I18nManager, StyleProp, ViewStyle} from 'react-native';
import Svg, {Circle, G, Path, Rect} from 'react-native-svg';

// Hassad's single icon family (Design Lock v2 §12): 24-pt grid, 1.5 stroke,
// round caps and joins. Paths are drawn for left-to-right; `MIRRORED` glyphs
// flip in RTL, objects never do.

type Shape = React.ReactNode;

const S = {
  harvest: (
    <>
      <Path d="M6 3.5h12v17H6z" />
      <Path d="M14 3.5v6.5l-2-1.6-2 1.6V3.5" />
    </>
  ),
  library: (
    <>
      <Rect x={3.5} y={4} width={4} height={16} rx={1} />
      <Rect x={8.5} y={6.5} width={4} height={13.5} rx={1} />
      <Path d="m14.3 7.6 3.7-1 3.3 12.6-3.7 1z" />
    </>
  ),
  me: (
    <>
      <Circle cx={12} cy={8.5} r={3.6} />
      <Path d="M5 20c1.3-3.4 3.9-5 7-5s5.7 1.6 7 5" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <Circle cx={11} cy={11} r={6.5} />
      <Path d="m20 20-4.3-4.3" />
    </>
  ),
  bell: (
    <>
      <Path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14z" />
      <Path d="M10 21h4" />
    </>
  ),
  back: <Path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  forward: <Path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  chevronDown: <Path d="m6 9.5 6 6 6-6" />,
  arrowNext: <Path d="M5 12h14m0 0-6-6m6 6-6 6" />,
  more: (
    <>
      <Circle cx={5.5} cy={12} r={1.2} fill="currentColor" stroke="none" />
      <Circle cx={12} cy={12} r={1.2} fill="currentColor" stroke="none" />
      <Circle cx={18.5} cy={12} r={1.2} fill="currentColor" stroke="none" />
    </>
  ),
  star: (
    <Path d="M12 3l2.14 3.83 4.22-1.19-1.19 4.22L21 12l-3.83 2.14 1.19 4.22-4.22-1.19L12 21l-2.14-3.83-4.22 1.19 1.19-4.22L3 12l3.83-2.14-1.19-4.22 4.22 1.19z" />
  ),
  share: (
    <>
      <Path d="M12 14.5V3.5m0 0-4 4m4-4 4 4" />
      <Path d="M7 10.5H5.5v10h13v-10H17" />
    </>
  ),
  edit: (
    <>
      <Path d="M4.5 19.5h3.8L19 8.8 15.2 5 4.5 15.7z" />
      <Path d="m13.3 6.9 3.8 3.8" />
    </>
  ),
  image: (
    <>
      <Rect x={3.5} y={5} width={17} height={14} rx={2.5} />
      <Circle cx={9} cy={10} r={1.6} />
      <Path d="m20.5 15.5-4.8-4.8-8.2 8.3" />
    </>
  ),
  camera: (
    <>
      <Path d="M4 8.5h3.2L9 6h6l1.8 2.5H20v11H4z" />
      <Circle cx={12} cy={13.5} r={3.4} />
    </>
  ),
  eye: (
    <>
      <Path d="M2.8 12c2.1-4 5.2-6 9.2-6s7.1 2 9.2 6c-2.1 4-5.2 6-9.2 6s-7.1-2-9.2-6z" />
      <Circle cx={12} cy={12} r={2.9} />
    </>
  ),
  eyeOff: (
    <>
      <Path d="M9.9 6.3A9.6 9.6 0 0 1 12 6c4 0 7.1 2 9.2 6a15 15 0 0 1-2.6 3.4M14.1 17.7a9.6 9.6 0 0 1-2.1.3c-4 0-7.1-2-9.2-6a15 15 0 0 1 2.6-3.4" />
      <Path d="M3.5 3.5l17 17M9.9 9.9a2.9 2.9 0 0 0 4.2 4.2" />
    </>
  ),
  lock: (
    <>
      <Rect x={5} y={10.5} width={14} height={10} rx={2.5} />
      <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  shelf: (
    <>
      <Path d="M3 20.5h18" />
      <Rect x={5} y={6} width={3.2} height={14.5} rx={0.8} />
      <Rect x={9.6} y={9} width={3.2} height={11.5} rx={0.8} />
      <Path d="m14.4 10.2 3-.9 3 10.8-3 .9z" />
    </>
  ),
  read: <Path d="M12 6.8C10 5.2 7.4 4.6 3.5 4.9v13.6c3.9-.3 6.5.3 8.5 1.9 2-1.6 4.6-2.2 8.5-1.9V4.9c-3.9-.3-6.5.3-8.5 1.9zm0 0v13.6" />,
  sort: <Path d="M7.5 4.5v15m0 0-3-3m3 3 3-3M16.5 19.5v-15m0 0-3 3m3-3 3 3" />,
  grid: (
    <>
      <Rect x={4} y={4} width={6.5} height={6.5} rx={1.5} />
      <Rect x={13.5} y={4} width={6.5} height={6.5} rx={1.5} />
      <Rect x={4} y={13.5} width={6.5} height={6.5} rx={1.5} />
      <Rect x={13.5} y={13.5} width={6.5} height={6.5} rx={1.5} />
    </>
  ),
  list: <Path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  close: <Path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  check: <Path d="m5 12.5 4.5 4.5L19 7.5" />,
  clock: (
    <>
      <Circle cx={12} cy={12} r={8.75} />
      <Path d="M12 7.5V12l3 2" />
    </>
  ),
  offline: (
    <>
      <Path d="M3.5 3.5l17 17" />
      <Path d="M7.8 8.2A5.5 5.5 0 0 0 7 19h10.5M19.9 16.9A3.8 3.8 0 0 0 17 10.3a5.5 5.5 0 0 0-7.4-4" />
    </>
  ),
  retry: (
    <>
      <Path d="M19.5 12A7.5 7.5 0 1 1 17 6.4" />
      <Path d="M19.5 3.5v4.2h-4.2" />
    </>
  ),
  mail: (
    <>
      <Rect x={3.5} y={5.5} width={17} height={13} rx={2.5} />
      <Path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </>
  ),
  key: (
    <>
      <Circle cx={8} cy={15.5} r={3.8} />
      <Path d="m10.8 12.8 8-8M16.3 7.3l2.2 2.2M13.8 9.8l1.6 1.6" />
    </>
  ),
  moon: <Path d="M19.5 14.6A7.6 7.6 0 0 1 9.4 4.5a7.6 7.6 0 1 0 10.1 10.1z" />,
  // "Follow the system": a disc half in light, half in shade.
  auto: (
    <>
      <Circle cx={12} cy={12} r={8.25} />
      <Path d="M12 3.75a8.25 8.25 0 0 1 0 16.5z" fill="currentColor" stroke="none" />
    </>
  ),
  sun: (
    <>
      <Circle cx={12} cy={12} r={3.8} />
      <Path d="M12 3v1.8M12 19.2V21M3 12h1.8M19.2 12H21M5.6 5.6l1.3 1.3M17.1 17.1l1.3 1.3M5.6 18.4l1.3-1.3M17.1 6.9l1.3-1.3" />
    </>
  ),
  language: (
    <>
      <Path d="M4 6.5h9M8.5 4.5v2c0 4-1.9 6.9-4.5 8.5M6.2 10.5c1.5 2 3.3 3.3 5.8 4.2" />
      <Path d="m13 20 3.5-8.5L20 20M14.3 17.2h4.4" />
    </>
  ),
  signOut: (
    <>
      <Path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10" />
      <Path d="m14 8 4 4-4 4M18 12H8.5" />
    </>
  ),
  trash: <Path d="M4.5 7h15M9.5 4h5M6.5 7l1 13h9l1-13" />,
  info: (
    <>
      <Circle cx={12} cy={12} r={8.75} />
      <Path d="M12 11v5.2M12 7.9v.1" />
    </>
  ),
  copy: (
    <>
      <Rect x={8.5} y={8.5} width={11.5} height={11.5} rx={2.5} />
      <Path d="M15.5 8.5V6.5a2.5 2.5 0 0 0-2.5-2.5H6.5A2.5 2.5 0 0 0 4 6.5V13a2.5 2.5 0 0 0 2.5 2.5h2" />
    </>
  ),
  download: <Path d="M12 4.5v11m0 0-4-4m4 4 4-4M5 19.5h14" />,
} satisfies Record<string, Shape>;

export type IconName = keyof typeof S;

const MIRRORED: ReadonlySet<IconName> = new Set<IconName>(['back', 'forward', 'arrowNext', 'signOut']);

export interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Icon = ({name, size = 22, color, strokeWidth = 1.5, filled = false, style}: IconProps) => {
  const flip = MIRRORED.has(name) && I18nManager.isRTL;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      color={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}>
      {/* Mirror inside the drawing: a style transform on the Svg view can be
          dropped by Fabric on re-render, leaving an arrow pointing backwards. */}
      {flip ? <G transform="matrix(-1 0 0 1 24 0)">{S[name]}</G> : S[name]}
    </Svg>
  );
};
