import {NativeModules, Platform} from 'react-native';

const native = NativeModules.HassadSystemBars as {setDarkContent?: (dark: boolean) => void} | undefined;

/** Android: dark or light status/navigation bar icons. iOS uses StatusBar. */
export const setSystemBarContent = (darkContent: boolean) => {
  if (Platform.OS === 'android') {
    native?.setDarkContent?.(darkContent);
  }
};
