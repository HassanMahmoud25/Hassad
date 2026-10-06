import React, {ReactNode, useEffect, useRef} from 'react';
import {Animated, Modal, Pressable, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {motion} from '../theme/motion';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** A solid card for irreversible decisions — never glass, so the words are
 * read against a calm surface. */
export const Dialog = ({visible, onClose, children}: DialogProps) => {
  const {colors} = useTheme();
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {toValue: visible ? 1 : 0, duration: motion.base, easing: motion.ease, useNativeDriver: true}).start();
  }, [visible, progress]);
  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent animationType="none">
      <Animated.View style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(24,16,10,0.5)', opacity: progress}]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        accessibilityRole="alert"
        accessibilityViewIsModal
        style={{
          position: 'absolute',
          top: '24%',
          start: 22,
          end: 22,
          backgroundColor: colors.cardHi,
          borderRadius: 32,
          paddingTop: 28,
          paddingHorizontal: 24,
          paddingBottom: 20,
          boxShadow: '0px 30px 60px -20px rgba(20,12,4,0.55)',
          opacity: progress,
          transform: [{scale: progress.interpolate({inputRange: [0, 1], outputRange: [0.97, 1]})}],
        }}>
        {children}
      </Animated.View>
    </Modal>
  );
};
