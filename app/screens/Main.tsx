import React, {useMemo, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import {TabBar, TabView} from 'react-native-tab-view';
import {Books} from '../components/Books';
import {Folders} from '../components/Folders';
import {useWindowDimensions} from 'react-native';
import colors from '../configs/colors';

export const MainScreen = () => {
  const dimensions = useWindowDimensions();

  const [index] = useState<number>(1);
  const [routes] = useState<{key: string; title: string}[]>([
    {key: 'books', title: 'كتب'},
    {key: 'folders', title: 'مجلدات'},
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

      <TouchableOpacity style={styles.floatingButton}>
        <Image
          source={require('../assets/icons/plusIcon.png')}
          resizeMode="contain"
          style={styles.plusIcon}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.mainScreen,
    },
    container: {
      width: '92.5%',
      alignSelf: 'center',
    },
    tabBar: {
      backgroundColor: colors.white,
      borderRadius: 20,
      elevation: 0,
      justifyContent: 'space-between',
      marginTop: 20,
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
      backgroundColor: colors.primaryBlack,
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
    floatingButton: {
      width: 53,
      height: 53,
      borderRadius: 50,
      position: 'absolute',
      right: 15,
      bottom: 40,
      backgroundColor: colors.primaryBlue,
      justifyContent: 'center',
      alignItems: 'center',
    },
    plusIcon: {
      width: 18,
      height: 18,
    },
  });
};
