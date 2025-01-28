import React, {useMemo} from 'react';
import {Image, Text, View, StyleSheet, ScrollView} from 'react-native';
import {ThereAreNoItemsComp} from './ThereAreNoItemsComp';
import colors from '../configs/colors';

export const Folders = () => {
  const styles = useMemo(() => getStyles(), []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.folderCount}>{'عدد المجلدات :  0'}</Text>

        <Image
          source={require('../assets/icons/filterIcon.png')}
          resizeMode="contain"
          style={styles.filterIcon}
        />
      </View>

      <ThereAreNoItemsComp
        imageSrc={require('../assets/images/thereAreNoFolders.png')}
        text="لا يوجد مجلدات هيا نبدأ!"
        subText="ابدأ التجربة وانقر الأيقونة بالأسفل وأنشئ مجلداً"
      />
    </ScrollView>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    headerContainer: {
      marginTop: 15,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    folderCount: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 14,
      textAlign: 'right',
      color: colors.primaryBlack,
    },
    filterIcon: {
      width: 22,
      height: 22,
    },
  });
};
