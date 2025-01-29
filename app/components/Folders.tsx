import React, {useMemo} from 'react';
import {Image, Text, View, StyleSheet, ScrollView} from 'react-native';
import {ThereAreNoItemsComp} from './ThereAreNoItemsComp';
import colors from '../configs/colors';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider'; // Import useRTL from RTLProvider

export const Folders = () => {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.folderCount}>{t('folders count', {count: 0})}</Text>

        <Image
          source={require('../assets/icons/filterIcon.png')}
          resizeMode="contain"
          style={styles.filterIcon}
        />
      </View>

      <ThereAreNoItemsComp
        imageSrc={require('../assets/images/thereAreNoFolders.png')}
        text={t("No folders. Let's start!")}
        subText={t(
          'Start the experience and click the icon below to create a folder',
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
