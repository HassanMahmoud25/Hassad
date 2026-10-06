import React, {useEffect, useState} from 'react';
import {Platform, StatusBar} from 'react-native';
import {QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './app/contexts/AuthContext';
import {RootNavigator} from './app/navigation/RootNavigator';
import {isOnboarded} from './app/lib/onboarding';
import {queryClient} from './app/queries/queryClient';
import {ThemeProvider, useTheme} from './app/theme/ThemeProvider';
import {bootstrapLanguage} from './app/lib/locale';
import {setSystemBarContent} from './app/lib/systemBars';

const ThemedStatusBar = () => {
  const {isDark} = useTheme();
  useEffect(() => setSystemBarContent(!isDark), [isDark]);
  // Android: MainActivity draws edge to edge and HassadSystemBars sets the
  // icon colour. RN's StatusBar would re-apply its own window insets
  // handling there and pull the app back inside the system bars.
  return Platform.OS === 'ios' ? <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} /> : null;
};

function App(): React.JSX.Element | null {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    Promise.all([bootstrapLanguage(), isOnboarded()])
      .then(([directionSettled, onboarding]) => {
        if (!directionSettled) {
          return; // the app is restarting into the stored direction
        }
        setOnboarded(onboarding);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ThemedStatusBar />
          <AuthProvider>
            <RootNavigator initiallyOnboarded={onboarded} />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
