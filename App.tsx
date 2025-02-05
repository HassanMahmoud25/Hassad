import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainScreen} from './app/screens/Main';
import {FavoriteScreen} from './app/screens/Favorite';
import {ProfileScreen} from './app/screens/Profile';
import {NavigationHome} from './app/navigation/NavigationHome';
import {SafeAreaView, StatusBar} from 'react-native';
import {BookBenefitsScreen} from './app/screens/BookBenefitsScreen';
import {BenefitDetails} from './app/screens/BenefitDetails';
import {FolderBooks} from './app/screens/FolderBooks';
import {RTLProvider} from './app/contexts/RTLProvider';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={{flex: 1}}>
      <RTLProvider>
        <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="home"
            screenOptions={{headerShown: false, animation: 'fade'}}>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Favorite" component={FavoriteScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="home" component={NavigationHome} />
            <Stack.Screen
              name="bookBenefits"
              component={BookBenefitsScreen}
              options={{animation: 'fade_from_bottom'}}
            />
            <Stack.Screen
              name="benefitDetails"
              component={BenefitDetails}
              options={{animation: 'fade_from_bottom'}}
            />
            <Stack.Screen
              name="folderBooks"
              component={FolderBooks}
              options={{animation: 'fade_from_bottom'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </RTLProvider>
    </SafeAreaView>
  );
}

export default App;
