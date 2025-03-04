import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {ThereAreNoItemsComp} from './ThereAreNoItemsComp';
import colors from '../configs/colors';
import {Folder} from './Folder';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider';
import {getFolders} from '../services/foldersService';

export const Folders = () => {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);
  const [folders, setFolders] = useState<
    {_id: string; name: string; num_of_books: number}[]
  >([]);
  const [loadingFolders, setLoadingFolders] = useState<boolean>(true);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoadingFolders(true);
        const token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZjNGIwOTI4NDZlYTRjMmM2ZWYxNjI4IiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvIiwiaWF0IjoxNzI0MjI3MTk0fQ.iAjowbF9o8g2jnm-Dc0gJ7PMMPtLTyVzhhYKErwcewg';
        const folders = await getFolders(token);
        setFolders(folders);
      } catch (err) {
        console.log('fetchFolders ERROR ==> ', err);
      } finally {
        setLoadingFolders(false);
      }
    };

    fetchFolders();
  }, []);

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
        {loadingFolders ? (
          <View style={styles.indicatorStyle}>
            <ActivityIndicator size={50} color={colors.primaryMove} />
          </View>
        ) : (
          <>
            {folders.length > 0 ? (
              <View style={styles.foldersContainer}>
                {folders.map(folder => (
                  <Folder
                    key={folder._id}
                    folderId={folder._id}
                    folderName={folder.name}
                    booksCount={folder.num_of_books}
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
          </>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: '5%',
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
      flexDirection: isRTL ? 'row' : 'row-reverse',
      flexWrap: 'wrap',
      columnGap: '5%',
      rowGap: 20,
      marginBottom: 35,
    },
    indicatorStyle: {
      top: 150,
    },
  });
};
