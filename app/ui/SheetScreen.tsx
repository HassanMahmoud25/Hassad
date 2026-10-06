import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {Animated, Keyboard, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeProvider';
import {motion} from '../theme/motion';
import {useReduceMotion} from '../lib/a11y';
import {Glass} from './Glass';

/** A navigation screen presented as a floating glass sheet over the screen
 * beneath (transparent modal). Tapping the scrim dismisses it. */
export const SheetScreen = ({children, onDismiss, accessibilityLabel}: {children: ReactNode; onDismiss: () => void; accessibilityLabel?: string}) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const {height} = useWindowDimensions();
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const [keyboard, setKeyboard] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {toValue: 1, duration: motion.base, easing: motion.ease, useNativeDriver: true}).start();
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e => setKeyboard(e.endCoordinates.height));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [progress]);

  const bottom = 8 + (keyboard > 0 ? keyboard : insets.bottom);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, {backgroundColor: colors.scrim, opacity: progress}]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityRole="button" accessibilityLabel="close" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
        style={{
          position: 'absolute',
          start: 8,
          end: 8,
          bottom,
          maxHeight: height - bottom - insets.top - 12,
          opacity: progress,
          transform: [{translateY: progress.interpolate({inputRange: [0, 1], outputRange: [reduce ? 0 : 48, 0]})}],
        }}>
        <Glass radius={36} strong style={{overflow: 'hidden'}}>
          <ScrollView keyboardShouldPersistTaps="handled" bounces={false} contentContainerStyle={{paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20}}>
            <View style={{width: 38, height: 5, borderRadius: 3, backgroundColor: colors.rule, alignSelf: 'center', marginBottom: 16}} />
            {children}
          </ScrollView>
        </Glass>
      </Animated.View>
    </View>
  );
};
