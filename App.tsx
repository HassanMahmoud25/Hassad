import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainScreen} from './app/screens/Main';
import {FavoriteScreen} from './app/screens/Favorite';
import {ProfileScreen} from './app/screens/Profile';
import {NavigationHome} from './app/navigation/NavigationHome';
import { SafeAreaView, StatusBar, View } from 'react-native';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={"dark-content"} backgroundColor={"transparent"} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="home"
          screenOptions={{headerShown: false, animation: 'fade'}}>
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Favorite" component={FavoriteScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="home" component={NavigationHome} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default App;
