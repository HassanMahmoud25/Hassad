import React from 'react';
import Svg, {Circle, Defs, Path, RadialGradient, Stop} from 'react-native-svg';

/** The Hassad brand mark as a wax seal: a single wheat ear in gold. Used
 * only where the Design Lock allows wheat (launch, email seal, share stamp). */
export const WheatSeal = ({size = 56}: {size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Defs>
      <RadialGradient id="wax" cx="38%" cy="32%" r="70%">
        <Stop offset="0" stopColor="#D9B467" />
        <Stop offset="1" stopColor="#A9792C" />
      </RadialGradient>
    </Defs>
    <Circle cx={28} cy={28} r={27} fill="url(#wax)" />
    <Circle cx={28} cy={28} r={22.5} fill="none" stroke="#7E5718" strokeOpacity={0.45} strokeWidth={1} />
    {/* Stalk */}
    <Path d="M28 42V14" stroke="#5E3F0F" strokeWidth={1.4} strokeLinecap="round" fill="none" />
    {/* Grains, paired up the stalk */}
    {[0, 1, 2, 3].map(i => {
      const y = 36 - i * 6;
      return (
        <React.Fragment key={i}>
          <Path d={`M28 ${y}c-4.2-0.6-6.4-3.4-6.6-6.8 3.6 0.2 6.1 2.4 6.6 6.8z`} fill="#5E3F0F" fillOpacity={0.88} />
          <Path d={`M28 ${y}c4.2-0.6 6.4-3.4 6.6-6.8-3.6 0.2-6.1 2.4-6.6 6.8z`} fill="#5E3F0F" fillOpacity={0.88} />
        </React.Fragment>
      );
    })}
    <Path d="M28 14c-1.4-2.4-1.2-4.6 0-6.4 1.2 1.8 1.4 4 0 6.4z" fill="#5E3F0F" fillOpacity={0.88} />
  </Svg>
);
