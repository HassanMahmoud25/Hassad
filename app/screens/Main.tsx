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
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider';

export const MainScreen = () => {
  const {t} = useTranslation();
  const dimensions = useWindowDimensions();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  const [index] = useState<number>(1);
  // const [routes] = useState<{key: string; title: string}[]>([
  //   {key: 'books', title: t('books')},
  //   {key: 'folders', title: t('folders')},
  // ]);
  const routes = useMemo(
    () => [
      {key: 'books', title: t('books')},
      {key: 'folders', title: t('folders')},
    ],
    [t],
  );
  const routesToRender = isRTL ? routes : [...routes].reverse();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader title={t('home page')} showSearchIcon={true} />

      <TabView
        navigationState={{index, routes: routesToRender}}
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

const getStyles = (isRTL: boolean) => {
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
      [isRTL ? 'left' : 'right']: 15,
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
