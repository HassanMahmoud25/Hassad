import React, {useMemo} from 'react';
import {Image, ScrollView, Text, View, StyleSheet} from 'react-native';
import {ThereAreNoItemsComp} from './ThereAreNoItemsComp';
import colors from '../configs/colors';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider';

export const Books = () => {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.folderCount}>{t('books count', {count: 0})}</Text>

        <Image
          source={require('../assets/icons/filterIcon.png')}
          resizeMode="contain"
          style={styles.filterIcon}
        />
      </View>

      <ThereAreNoItemsComp
        imageSrc={require('../assets/images/thereAreNoBooks.png')}
        text={t("No books. Let's start!")}
        subText={t(
          'Start your experience and click the icon below to add a book',
        )}
      />
    </ScrollView>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    headerContainer: {
      marginTop: 15,
      flexDirection: isRTL ? 'row' : 'row-reverse',
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
