import React from 'react';
import Svg, {Path} from 'react-native-svg';

/** The bookmark ribbon that marks a note's colour in the margin. */
export const Ribbon = ({color, width = 9, height = 17}: {color: string; width?: number; height?: number}) => (
  <Svg width={width} height={height} viewBox="0 0 9 17">
    <Path d="M0 0H9V17L4.5 12.24L0 17Z" fill={color} />
  </Svg>
);
