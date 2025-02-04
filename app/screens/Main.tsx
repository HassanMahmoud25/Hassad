import React, {useMemo, useState} from 'react';
import {SafeAreaView, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import {TabBar, TabView} from 'react-native-tab-view';
import {Books} from '../components/Books';
import {Folders} from '../components/Folders';
import {useWindowDimensions} from 'react-native';
import colors from '../config';
import {AddComponent} from '../components/AddComponent';

export const MainScreen = () => {
  const dimensions = useWindowDimensions();

  const [index] = useState<number>(1);
  const [routes] = useState<{key: string; title: string}[]>([
    {key: 'folders', title: 'مجلدات'},
    {key: 'books', title: 'كتب'},
  ]);

  interface SceneProps {
    route: {key: string};
  }

  const renderScene = ({route}: SceneProps): JSX.Element | null => {
    switch (route.key) {
      case 'books':
        return <Books />;
      case 'folders':
        return <Folders />;
      default:
        return null;
    }
  };

  const styles = useMemo(() => getStyles(), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader title="الصفحة الرئيسية" showSearchIcon={true} />

      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={() => {}}
        initialLayout={{width: dimensions.width}}
        style={styles.container}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={styles.indicator}
            pressColor={colors.white}
          />
        )}
        animationEnabled={true}
        commonOptions={{
          label: ({labelText, focused}: any) => (
            <TouchableOpacity
              style={[styles.tabButton, focused && styles.tabButtonFocused]}>
              <Text
                style={[
                  styles.tabButtonText,
                  focused && styles.tabButtonTextFocused,
                ]}>
                {labelText}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <AddComponent positionStyle={styles.addBtnStyle} />
    </SafeAreaView>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      width: '100%',
      alignSelf: 'center',
    },
    tabBar: {
      borderRadius: 20,
      elevation: 0,
      backgroundColor: colors.white,
      justifyContent: 'space-between',
      marginTop: 10,
      width: '92.5%',
      alignSelf: 'center',
    },
    indicator: {
      height: 0,
    },
    tabButton: {
      backgroundColor: colors.white,
      width: 155,
      paddingVertical: 5,
      borderRadius: 18,
    },
    tabButtonFocused: {
      backgroundColor: colors.primaryMove,
    },
    tabButtonText: {
      color: colors.lightBlackText,
      fontFamily: 'ElMessiri-Medium',
      fontSize: 20,
      textAlign: 'center',
    },
    tabButtonTextFocused: {
      color: colors.white,
    },
    addBtnStyle: {
      right: '3.75%',
    },
  });
};
