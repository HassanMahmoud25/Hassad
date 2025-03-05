import React, {useMemo, useRef, useState} from 'react';
import {SafeAreaView, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import {TabBar, TabView} from 'react-native-tab-view';
import {Books} from '../components/Books';
import {Folders} from '../components/Folders';
import {useWindowDimensions} from 'react-native';
import colors from '../configs/colors';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider';
import {AddComponent} from '../components/AddComponent';
import AddItemModal from '../components/Modals/AddItemModal';

export const MainScreen = () => {
  const {t} = useTranslation();

  const dimensions = useWindowDimensions();

  const indexRef = useRef<number>(0);

  const isRTL = useRTL();

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);

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

  const handleClickingAddBtn = () => {
    setShowAddItemModal(true);
  };

  const closeAddItemModal = () => {
    setShowAddItemModal(false);
  };

  const handleIndexChnage = (idx: number) => {
    indexRef.current = idx;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader
        title={t('home page')}
        showSearchIcon={true}
        onPressHandler={() => {
          return true;
        }}
      />

      <AddItemModal
        visible={showAddItemModal}
        type={indexRef.current === 0 ? 'books' : 'folders'}
        onCancel={closeAddItemModal}
      />

      <TabView
        navigationState={{index: indexRef.current, routes: routesToRender}}
        renderScene={renderScene}
        onIndexChange={handleIndexChnage}
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
      <AddComponent
        onPress={handleClickingAddBtn}
        positionStyle={styles.addBtnStyle}
      />
    </SafeAreaView>
  );
};

const getStyles = (isRTL: boolean) => {
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
      width: '90%',
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
      [isRTL ? 'left' : 'right']: '5%',
      bottom: 50,
    },
  });
};
