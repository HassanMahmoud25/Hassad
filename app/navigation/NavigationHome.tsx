import React, {useMemo} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainScreen} from '../screens/Main';
import {ProfileScreen} from '../screens/Profile';
import {FavoriteScreen} from '../screens/Favorite';
import {TouchableOpacity, StyleSheet, Image} from 'react-native';
import colors from '../config';

// Bottom Tab Navigator
const BottomTab = createBottomTabNavigator();

export const NavigationHome = () => {
  const styles = useMemo(() => getStyles(), []);

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
      <BottomTab.Screen
        options={{
          title: 'الملف',
          tabBarButton: props => (
            <TouchableOpacity
              onPress={props.onPress}
              style={styles.tabBarButton}>
              {props.children}
            </TouchableOpacity>
          ),
        }}
        name="Profile"
        component={ProfileScreen}
      />
      <BottomTab.Screen
        options={{
          title: 'المفضلة',
          tabBarButton: props => (
            <TouchableOpacity
              onPress={props.onPress}
              style={styles.tabBarButton}>
              {props.children}
            </TouchableOpacity>
          ),
        }}
        name="Favorite"
        component={FavoriteScreen}
      />
      <BottomTab.Screen
        options={{
          title: 'الرئيسية',
          tabBarButton: props => (
            <TouchableOpacity
              onPress={props.onPress}
              style={styles.tabBarButton}>
              {props.children}
            </TouchableOpacity>
          ),
        }}
        name="Main"
        component={MainScreen}
      />
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
