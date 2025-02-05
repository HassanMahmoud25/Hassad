import React, {useMemo} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainScreen} from '../screens/Main';
import {ProfileScreen} from '../screens/Profile';
import {FavoriteScreen} from '../screens/Favorite';
import {TouchableOpacity, StyleSheet, Image} from 'react-native';
import colors from '../configs/colors';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider'; // Import useRTL hook

// Bottom Tab Navigator
const BottomTab = createBottomTabNavigator();

export const NavigationHome = () => {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(), []);

  // Array of screens
  const screens = [
    {name: 'Main', component: MainScreen, title: t('home')},
    {name: 'Favorite', component: FavoriteScreen, title: t('favorite')},
    {name: 'Profile', component: ProfileScreen, title: t('profile')},
  ];
  // Reversing the order based on RTL state
  const screensToRender = isRTL ? screens : [...screens].reverse();

  return (
    <BottomTab.Navigator
      initialRouteName="Main"
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          let src: any;
          let dimentions: {} = {width: 25, height: 24};

          if (route.name === 'Main') {
            src = focused
              ? require('../assets/icons/homeTabIcon_active.png')
              : require('../assets/icons/homeTabIcon_inactive.png');

            dimentions = {with: 25, height: 24};
          } else if (route.name === 'Favorite') {
            src = focused
              ? require('../assets/icons/favoriteTabIcon_active.png')
              : require('../assets/icons/favoriteTabIcon_inactive.png');

            dimentions = {with: 24, height: 22};
          } else if (route.name === 'Profile') {
            src = focused
              ? require('../assets/icons/profileTabIcon_active.png')
              : require('../assets/icons/profileTabIcon_inactive.png');

            dimentions = {width: 23, height: 23};
          }

          return (
            <Image
              source={src}
              resizeMode={'contain'}
              style={{...dimentions}}
            />
          );
        },
        headerShown: false,
        tabBarActiveTintColor: colors.primaryMove,
        tabBarInactiveTintColor: colors.lightGrey,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        animation: 'shift',
      })}>
      {screensToRender.map(({name, component, title}) => (
        <BottomTab.Screen
          key={name}
          options={{
            title,
            tabBarButton: props => (
              <TouchableOpacity
                onPress={props.onPress}
                style={styles.tabBarButton}>
                {props.children}
              </TouchableOpacity>
            ),
          }}
          name={name}
          component={component}
        />
      ))}
    </BottomTab.Navigator>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    tabBar: {
      height: 80,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      paddingTop: 10,
      justifyContent: 'space-between',
    },
    tabBarLabel: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 12,
      marginTop: 4,
    },
    tabBarButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
