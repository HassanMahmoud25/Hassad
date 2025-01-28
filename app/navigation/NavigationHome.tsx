import React, {useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainScreen} from '../screens/Main';
import {ProfileScreen} from '../screens/Profile';
import {FavoriteScreen} from '../screens/Favorite';
import {TouchableOpacity, StyleSheet} from 'react-native';
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
        tabBarIcon: ({focused, color}) => {
          let iconName: string = 'help-outline';

          if (route.name === 'Main') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favorite') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={25} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: colors.primaryBlack,
        tabBarInactiveTintColor: colors.lightGray,
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
      height: 75,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      paddingTop: 5,
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
