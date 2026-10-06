import {useEffect, useState} from 'react';
import {Keyboard, Platform} from 'react-native';

/** Keyboard height, or 0 when hidden. The app draws edge to edge, so
 * Android's adjustResize no longer lifts content: screens pad themselves. */
export const useKeyboardHeight = () => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
};
