import React, {ReactNode} from 'react';
import {ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import Svg, {Defs, Ellipse, RadialGradient, Rect, Stop} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter} from '../../theme/tokens';
import {useKeyboardHeight} from '../../lib/keyboard';
import {Text} from '../../ui';
import {night} from './night';

interface Props {
  title: string;
  subtitle?: string;
  /** Above the title: back button, banner. */
  top?: ReactNode;
  /** Drawn in the night header behind the title (e.g. a book). */
  art?: ReactNode;
  children: ReactNode;
  /** Pinned under the form, e.g. "New to Hassad? Create an account". */
  footer?: ReactNode;
}

/** Night header with a warm glow, title in gold; the form on a paper sheet
 * that rises with the keyboard (SignIn / CreateAccount boards). */
export const AuthLayout = ({title, subtitle, top, art, children, footer}: Props) => {
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const keyboard = useKeyboardHeight();
  const headerH = Math.max(230, Math.round(height * 0.3)) + insets.top;
  return (
    <View style={{flex: 1, backgroundColor: night.bg}}>
      <Svg width={width} height={headerH + 40} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#E2B478" stopOpacity={0.2} />
            <Stop offset="1" stopColor="#E2B478" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={headerH + 40} fill={night.bg} />
        <Ellipse cx={width * 0.5} cy={headerH * 0.35} rx={width * 0.75} ry={headerH * 0.7} fill="url(#glow)" />
      </Svg>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{flexGrow: 1, paddingBottom: keyboard}}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={{height: headerH, paddingTop: insets.top + 8, paddingHorizontal: gutter, justifyContent: 'space-between'}}>
          <View>{top}</View>
          {art}
          <View style={{paddingBottom: 26}}>
            <Text role="display1" color={night.gold} accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? (
              <Text role="body" color={night.ink2} style={{marginTop: 4}}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {/* The sheet: paper in the reader's theme. */}
        <View
          style={{
            flexGrow: 1,
            marginTop: -2,
            backgroundColor: isDark ? colors.card : colors.paper,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: gutter,
            paddingTop: 26,
            paddingBottom: (keyboard ? 16 : insets.bottom + 20),
          }}>
          <View style={{flex: 1}}>{children}</View>
          {footer ? <View style={{marginTop: 24, alignItems: 'center'}}>{footer}</View> : null}
        </View>
      </ScrollView>
    </View>
  );
};
