// RTLProvider.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import {I18nManager} from 'react-native';
import i18n from '../configs/i18n';

const RTLContext = createContext<boolean | undefined>(undefined);

export const useRTL = () => {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
};

interface RTLProviderProps {
  children: ReactNode;
}

export const RTLProvider = ({children}: RTLProviderProps) => {
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      I18nManager.forceRTL(lng === 'ar');
      setIsRTL(lng === 'ar');
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return <RTLContext.Provider value={isRTL}>{children}</RTLContext.Provider>;
};
