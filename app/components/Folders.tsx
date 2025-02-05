import React, {useMemo, useState} from 'react';
import {Image, Text, View, StyleSheet, ScrollView} from 'react-native';
import {ThereAreNoItemsComp} from './ThereAreNoItemsComp';
import colors from '../configs/colors';
import {Folder} from './Folder';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider'; // Import useRTL from RTLProvider

export const Folders = () => {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);
  const [folders] = useState<
    {key: number; folderName: string; booksCount: number}[]
  >([
    {
      key: 1,
      folderName: 'كتب علمية كتب علمية كتب علمية',
      booksCount: 7,
    },
    {
      key: 2,
      folderName: 'كتب علمية',
      booksCount: 7,
    },
    {
      key: 3,
      folderName: 'كتب علمية',
      booksCount: 7,
    },
    {
      key: 4,
      folderName: 'كتب علمية',
      booksCount: 7,
    },
    {
      key: 5,
      folderName: 'كتب علمية',
      booksCount: 7,
    },
    {
      key: 6,
      folderName: 'كتب علمية',
      booksCount: 7,
    },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.folderCount}>
          {t('folders count', {count: folders.length})}
        </Text>

        <Image
          source={require('../assets/icons/filterIcon.png')}
          resizeMode="contain"
          style={styles.filterIcon}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {folders.length > 0 ? (
          <View style={styles.foldersContainer}>
            {folders.map(folder => (
              <Folder
                key={folder.key}
                folderName={folder.folderName}
                booksCount={folder.booksCount}
              />
            ))}
          </View>
        ) : (
          <ThereAreNoItemsComp
            imageSrc={require('../assets/images/thereAreNoFolders.png')}
            text="لا يوجد مجلدات هيا نبدأ!"
            subText="ابدأ التجربة وانقر الأيقونة بالأسفل وأنشئ مجلداً"
          />
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: '3.75%',
    },
    headerContainer: {
      marginTop: 15,
      flexDirection: isRTL ? 'row' : 'row-reverse',
      paddingBottom: 15,
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
      width: 17,
      height: 17,
    },
    foldersContainer: {
      flex: 1,
      width: '100%',
      marginTop: 10,
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      columnGap: '5%',
      rowGap: 20,
      marginBottom: 35,
    },
  });
};
