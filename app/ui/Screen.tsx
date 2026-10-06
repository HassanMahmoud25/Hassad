import React, {ReactNode, useRef} from 'react';
import {Animated, RefreshControl, StyleProp, View, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeProvider';
import {useTabBarSpace} from '../navigation/TabBar';

interface ScreenProps {
  children: ReactNode;
  /** Root tab screens leave room for the capsule. */
  tab?: boolean;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Paper, the top safe area, and room for floating chrome. */
export const Screen = ({children, tab, scroll = true, refreshing, onRefresh, contentStyle}: ScreenProps) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const scrollY = useRef(new Animated.Value(0)).current;
  const bottom = tab ? tabSpace : insets.bottom + 24;
  const padding = {paddingTop: insets.top + 12, paddingBottom: bottom};
  if (!scroll) {
    return <View style={[{flex: 1, backgroundColor: colors.paper}, padding, contentStyle]}>{children}</View>;
  }
  return (
    <View style={{flex: 1, backgroundColor: colors.paper}}>
      <Animated.ScrollView
        style={{flex: 1}}
        contentContainerStyle={[padding, contentStyle]}
        scrollEventThrottle={16}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true})}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.ink3} colors={[colors.ink2]} progressBackgroundColor={colors.card} /> : undefined}>
        {children}
      </Animated.ScrollView>
      {/* Paper under the status bar once content scrolls beneath it. */}
      <Animated.View
        pointerEvents="none"
        style={{position: 'absolute', top: 0, start: 0, end: 0, height: insets.top, backgroundColor: colors.paper, opacity: scrollY.interpolate({inputRange: [0, 16], outputRange: [0, 0.96], extrapolate: 'clamp'})}}
      />
    </View>
  );
};
