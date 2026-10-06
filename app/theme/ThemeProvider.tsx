import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Palette, palettes, ThemeName} from './tokens';
import {ReadingSize, READING_SCALE} from './type';
import {NumeralStyle} from '../lib/text';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Preferences {
  theme: ThemePreference;
  numerals: NumeralStyle;
  readingSize: ReadingSize;
}

const DEFAULT_PREFS: Preferences = {theme: 'system', numerals: 'latn', readingSize: 'default'};
const PREFS_KEY = 'hassad.prefs';

interface ThemeContextValue {
  name: ThemeName;
  colors: Palette;
  isDark: boolean;
  prefs: Preferences;
  readingScale: number;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const system = useColorScheme();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then(raw => {
        if (raw) {
          setPrefs({...DEFAULT_PREFS, ...JSON.parse(raw)});
        }
      })
      .catch(() => {});
  }, []);

  const setPref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs(prev => {
      const next = {...prev, [key]: value};
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const name: ThemeName = prefs.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : prefs.theme;

  const value = useMemo<ThemeContextValue>(
    () => ({
      name,
      colors: palettes[name],
      isDark: name === 'dark',
      prefs,
      readingScale: READING_SCALE[prefs.readingSize],
      setPref,
    }),
    [name, prefs, setPref],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
};

/** Draws its children in one palette whatever the reader's theme — onboarding
 * and the auth headers always sit at night (Design Lock v2). */
export const FixedTheme = ({name, children}: {name: ThemeName; children: ReactNode}) => {
  const ctx = useTheme();
  const value = useMemo<ThemeContextValue>(() => ({...ctx, name, colors: palettes[name], isDark: name === 'dark'}), [ctx, name]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
