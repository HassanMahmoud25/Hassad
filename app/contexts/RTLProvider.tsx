import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import {I18nManager} from 'react-native';
import i18n from '../configs/i18n';
import RNRestart from 'react-native-restart';

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
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    const handleLanguageChange = async (lng: string) => {
      const newRTL = lng === 'ar';
      I18nManager.forceRTL(newRTL);
      setIsRTL(newRTL);
      if (!initialRender) {
        RNRestart.Restart();
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    handleLanguageChange(i18n.language);
    setInitialRender(false);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RTLContext.Provider value={isRTL}>{children}</RTLContext.Provider>;
};
