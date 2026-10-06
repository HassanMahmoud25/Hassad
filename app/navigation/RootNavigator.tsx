import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, DevSettings, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createNavigationContainerRef, DarkTheme, DefaultTheme, NavigationContainer, Theme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '../contexts/AuthContext';
import {queryClient} from '../queries/queryClient';
import {takeResume} from '../lib/locale';
import {onOnboarded} from '../lib/onboarding';
import {DEV_API_KEY} from '../apis/client';
import {TOKEN_KEY, USER_KEY} from '../utils/storageKeys';
import {useTheme} from '../theme/ThemeProvider';
import {RootStackParamList, TabParamList} from './types';
import {TabBar} from './TabBar';
import {HarvestScreen} from '../features/harvest/HarvestScreen';
import {LibraryScreen} from '../features/library/LibraryScreen';
import {MeScreen} from '../features/me/MeScreen';
import {SelectionsScreen} from '../features/selections/SelectionsScreen';
import {PlaygroundScreen} from '../features/dev/PlaygroundScreen';
import {BookScreen} from '../features/book/BookScreen';
import {ShelfScreen} from '../features/shelf/ShelfScreen';
import {BookFormScreen} from '../features/bookForm/BookFormScreen';
import {NoteScreen} from '../features/note/NoteScreen';
import {EditorScreen} from '../features/editor/EditorScreen';
import {CaptureScreen} from '../features/capture/CaptureScreen';
import {SearchScreen} from '../features/search/SearchScreen';
import {OnboardingScreen} from '../features/onboarding/OnboardingScreen';
import {SignInScreen} from '../features/auth/SignInScreen';
import {SignUpScreen} from '../features/auth/SignUpScreen';
import {VerifyEmailScreen} from '../features/auth/VerifyEmailScreen';
import {ChangePasswordScreen} from '../features/auth/ChangePasswordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const MainTabs = () => (
  <Tabs.Navigator
    initialRouteName="harvest"
    screenOptions={{headerShown: false}}
    tabBar={props => <TabBar {...props} onCapture={() => props.navigation.navigate('capture')} />}>
    <Tabs.Screen name="harvest" component={HarvestScreen} />
    <Tabs.Screen name="library" component={LibraryScreen} />
    <Tabs.Screen name="selections" component={SelectionsScreen} />
  </Tabs.Navigator>
);

const LOCAL_API = 'http://localhost:4100';

export const RootNavigator = ({initiallyOnboarded}: {initiallyOnboarded: boolean}) => {
  const {isAuthenticated, isLoading, pendingVerify} = useAuth();
  const [onboarded, setOnboarded] = useState(initiallyOnboarded);
  useEffect(() => onOnboarded(() => setOnboarded(true)), []);
  const {colors, isDark} = useTheme();
  const navTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {...base, colors: {...base.colors, background: colors.paper, card: colors.paper, text: colors.ink, border: colors.rule, primary: colors.ink}};
  }, [isDark, colors]);

  useEffect(() => {
    if (__DEV__) {
      // Dev menu entry, so visual QA does not depend on a signed-in session.
      DevSettings.addMenuItem('Hassad · QA playground', () => navigationRef.isReady() && navigationRef.navigate('playground'));
      // Lets QA see first-load, offline and error states without reinstalling.
      DevSettings.addMenuItem('Hassad · Clear data cache', () => queryClient.resetQueries());
      // Auth QA runs against a local copy of the backend (adb reverse tcp:4100),
      // never production. Switching servers drops the session: a token belongs to one.
      DevSettings.addMenuItem('Hassad · Toggle local backend', async () => {
        const current = await AsyncStorage.getItem(DEV_API_KEY);
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        await (current ? AsyncStorage.removeItem(DEV_API_KEY) : AsyncStorage.setItem(DEV_API_KEY, LOCAL_API));
        DevSettings.reload();
      });
    }
  }, []);

  const verifyScreen = <Stack.Screen key="verifyEmail" name="verifyEmail" component={VerifyEmailScreen} initialParams={{from: 'signUp'}} options={{animation: 'fade'}} />;

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.paper}}>
        <ActivityIndicator color={colors.ink3} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      onReady={() => {
        // After a language restart, return to «أنا», where it was changed.
        takeResume().then(r => r === 'me' && isAuthenticated && navigationRef.navigate('me'));
      }}>
      <Stack.Navigator screenOptions={{headerShown: false, contentStyle: {backgroundColor: colors.paper}}}>
        {isAuthenticated ? (
          <>
            {/* Right after sign-up the app opens on email confirmation, once. */}
            {pendingVerify && verifyScreen}
            <Stack.Screen name="tabs" component={MainTabs} options={{animation: 'fade', animationTypeForReplace: 'push'}} />
            <Stack.Screen name="book" component={BookScreen} options={{animation: 'fade_from_bottom'}} />
            <Stack.Screen name="me" component={MeScreen} />
            <Stack.Screen name="shelf" component={ShelfScreen} options={{animation: 'fade_from_bottom'}} />
            <Stack.Screen name="bookForm" component={BookFormScreen} options={{presentation: 'transparentModal', animation: 'none', contentStyle: {backgroundColor: 'transparent'}}} />
            <Stack.Screen name="note" component={NoteScreen} options={{animation: 'fade_from_bottom'}} />
            <Stack.Screen name="editor" component={EditorScreen} options={{animation: 'slide_from_bottom'}} />
            <Stack.Screen name="capture" component={CaptureScreen} options={{presentation: 'transparentModal', animation: 'none', contentStyle: {backgroundColor: 'transparent'}}} />
            <Stack.Screen name="search" component={SearchScreen} options={{animation: 'fade'}} />
            {!pendingVerify && verifyScreen}
            <Stack.Screen name="changePassword" component={ChangePasswordScreen} />
          </>
        ) : (
          <>
            {!onboarded && <Stack.Screen name="onboarding" component={OnboardingScreen} />}
            <Stack.Screen name="signIn" component={SignInScreen} options={{animation: 'fade', animationTypeForReplace: 'pop'}} />
            <Stack.Screen name="signUp" component={SignUpScreen} options={{animation: 'fade'}} />
          </>
        )}
        {__DEV__ && <Stack.Screen name="playground" component={PlaygroundScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
