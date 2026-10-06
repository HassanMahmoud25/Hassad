import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {Animated, Keyboard, Modal, Platform, Pressable, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeProvider';
import {motion} from '../theme/motion';
import {useReduceMotion} from '../lib/a11y';
import {Glass} from './Glass';
import {Icon, IconName} from './Icon';
import {Text} from './Text';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
}

/** A floating glass sheet over a scrim (Design Lock v2 §07). */
export const Sheet = ({visible, onClose, children, accessibilityLabel}: SheetProps) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  const [keyboard, setKeyboard] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e => setKeyboard(e.endCoordinates.height));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {toValue: 1, duration: motion.base, easing: motion.ease, useNativeDriver: true}).start();
    } else if (mounted) {
      Animated.timing(progress, {toValue: 0, duration: motion.quick + 40, easing: motion.ease, useNativeDriver: true}).start(() => setMounted(false));
    }
  }, [visible, mounted, progress]);

  const translateY = progress.interpolate({inputRange: [0, 1], outputRange: [reduce ? 0 : 40, 0]});
  return (
    <Modal transparent visible={mounted} onRequestClose={onClose} statusBarTranslucent animationType="none">
      <Animated.View style={[StyleSheet.absoluteFill, {backgroundColor: colors.scrim, opacity: progress}]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="close" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
        style={{position: 'absolute', start: 8, end: 8, bottom: 8 + (keyboard > 0 ? keyboard : insets.bottom), opacity: progress, transform: [{translateY}]}}>
        <Glass radius={36} strong style={{paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20}}>
          <View style={{width: 38, height: 5, borderRadius: 3, backgroundColor: colors.rule, alignSelf: 'center', marginBottom: 16}} />
          {children}
        </Glass>
      </Animated.View>
    </Modal>
  );
};

interface MenuRowProps {
  icon: IconName;
  label: string;
  detail?: string;
  danger?: boolean;
  first?: boolean;
  onPress: () => void;
}

export const MenuRow = ({icon, label, detail, danger, first, onPress}: MenuRowProps) => {
  const {colors} = useTheme();
  const fg = danger ? colors.danger : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}، ${detail}` : label}
      style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 14, height: 56, paddingHorizontal: 4, borderTopWidth: first ? 0 : 1, borderTopColor: colors.rule2, opacity: pressed ? 0.55 : 1})}>
      <Icon name={icon} size={20} color={danger ? colors.danger : colors.ink2} />
      <Text role="body" color={fg} style={{flex: 1, fontFamily: 'IBMPlexSansArabic-Medium', fontSize: 15.5}} numberOfLines={1}>
        {label}
      </Text>
      {detail ? (
        <Text role="meta" tone="ink3">
          {detail}
        </Text>
      ) : null}
    </Pressable>
  );
};
