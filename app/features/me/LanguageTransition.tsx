import React, {useEffect, useRef} from 'react';
import {Animated, Modal, StyleSheet, Text as RNText, View} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {motion} from '../../theme/motion';
import {fonts} from '../../theme/type';
import {Lang} from '../../lib/locale';
import {Seal} from '../../ui';

/**
 * Changing language flips the whole layout, which needs a restart. Rather
 * than a blink, the page settles to paper and names the language it's
 * turning to; the restart happens behind it.
 */
export const LanguageTransition = ({to, name, onShown}: {to: Lang | null; name: string; onShown: () => void}) => {
  const {colors} = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!to) {
      return;
    }
    Animated.timing(fade, {toValue: 1, duration: motion.slow, easing: motion.ease, useNativeDriver: true}).start(() => setTimeout(onShown, 260));
  }, [to, fade, onShown]);
  const ar = to === 'ar';
  return (
    <Modal transparent visible={!!to} statusBarTranslucent animationType="none">
      <Animated.View style={[StyleSheet.absoluteFill, {backgroundColor: colors.paper, opacity: fade, alignItems: 'center', justifyContent: 'center'}]} accessibilityLiveRegion="polite">
        <Seal name={name} size={64} accessibilityLabel="" />
        <View style={{marginTop: 22}}>
          <RNText
            allowFontScaling={false}
            style={{fontFamily: ar ? fonts.thmanyah[500] : fonts.newsreader[400], fontSize: ar ? 32 : 34, color: colors.ink, textAlign: 'center', writingDirection: ar ? 'rtl' : 'ltr'}}>
            {ar ? 'العربية' : 'English'}
          </RNText>
        </View>
      </Animated.View>
    </Modal>
  );
};
