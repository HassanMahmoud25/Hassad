import React, {useMemo} from 'react';
import {Image, ScrollView, Text, View, StyleSheet} from 'react-native';
import {ThereAreNoItemsComp} from './ThereAreNoItemsComp';
import colors from '../config';

export const Books = () => {
  const styles = useMemo(() => getStyles(), []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.folderCount}>{'عدد الكتب :  0'}</Text>

        <Image
          source={require('../assets/icons/filterIcon.png')}
          resizeMode="contain"
          style={styles.filterIcon}
        />
      </View>

      <ThereAreNoItemsComp
        imageSrc={require('../assets/images/thereAreNoBooks.png')}
        text="لا يوجد كتب هيا نبدأ!"
        subText="ابدأ التجربة وانقر الأيقونة بالأسفل وأنشئ كتاباً"
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
