import React, {useEffect, useMemo, useState} from 'react';
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import colors from '../configs/colors';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {AddComponent} from '../components/AddComponent';
import {Book} from '../components/Book';
import {useRTL} from '../contexts/RTLProvider';
import {getFolderBooks} from '../services/foldersService';
import {ThereAreNoItemsComp} from '../components/ThereAreNoItemsComp';
import AddItemModal from '../components/Modals/AddItemModal';
import {t} from 'i18next';

type ParamList = {
  BookBenefitsScreen: {title: string; id: string};
};

export const FolderBooks = () => {
  const isRTL = useRTL();

  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [books, setBooks] = useState<
    {
      _id: string;
      name: string;
      img_url: string;
      num_of_benefits: number;
      createdAt: string;
    }[]
  >([]);

  const route = useRoute<RouteProp<ParamList, 'BookBenefitsScreen'>>();

  const {title, id} = route.params;

  const navigation = useNavigation();

  const backPresshandler = () => {
    navigation.goBack();
    return true;
  };

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  const fetchFolderBooks = async () => {
    try {
      setLoadingBooks(true);
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZjNGIwOTI4NDZlYTRjMmM2ZWYxNjI4IiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvIiwiaWF0IjoxNzI0MjI3MTk0fQ.iAjowbF9o8g2jnm-Dc0gJ7PMMPtLTyVzhhYKErwcewg';
      const folderBooks = await getFolderBooks(id, token);
      setBooks(folderBooks);
    } catch (err) {
      console.log('fetchFolderBooks ERROR ==> ', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    fetchFolderBooks();

    const backHandlerObj = BackHandler.addEventListener(
      'hardwareBackPress',
      backPresshandler,
    );

    return () => {
      backHandlerObj.remove();
    };
  }, []);

  const handleClickAddBtn = () => {
    setShowAddItemModal(true);
  };

  const closeAddItemModal = () => {
    setShowAddItemModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
        title={title}
        showBackIcon={true}
        onPressHandler={backPresshandler}
      />

      <AddItemModal
        visible={showAddItemModal}
        type={'books'}
        folderId={id}
        onRefresh={fetchFolderBooks}
        onCancel={closeAddItemModal}
      />

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBtnStyle}>
            <Image
              source={require('../assets/icons/searchIcon_light.png')}
              resizeMode={'contain'}
              style={styles.searchIconStyle}
            />
          </TouchableOpacity>
          <TextInput
            placeholder={t('searchForBook')}
            style={styles.searchInputField}
          />
        </View>

        <View style={styles.filterAndBooksCount}>
          <Text style={styles.booksCount}>{`${t('booksCount')} : ${
            books.length
          }`}</Text>
          <Image
            source={require('../assets/icons/filterIcon.png')}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loadingBooks ? (
            <View style={styles.indicatorStyle}>
              <ActivityIndicator size={50} color={colors.primaryMove} />
            </View>
          ) : books.length > 0 ? (
            <View style={styles.booksContainer}>
              {books.map(book => (
                <Book
                  key={book._id}
                  bookId={book._id}
                  bookCover={book.img_url}
                  bookName={book.name}
                  benefitsCount={book.num_of_benefits}
                />
              ))}
            </View>
          ) : (
            <ThereAreNoItemsComp
              imageSrc={require('../assets/images/folderIsEmpty.png')}
              text={t('folderIsEmptyLetsAddBooksToIt')}
              subText={t('StartTheExperienceClickTheIconBelowAndCreateBook')}
            />
          )}
        </ScrollView>

        <AddComponent
          onPress={handleClickAddBtn}
          positionStyle={styles.addBtnStyle}
        />
      </View>
    </SafeAreaView>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainScreen,
    },
    contentContainer: {
      flex: 1,
      width: '90%',
      alignSelf: 'center',
      marginTop: 15,
    },
    searchBtnStyle: {
      width: '15%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: {
      width: '100%',
      height: 55,
      flexDirection: isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 20,
    },
    searchIconStyle: {
      width: 20,
      height: 20,
      alignSelf: 'center',
    },
    searchInputField: {
      width: '80%',
      height: '100%',
      fontFamily: 'Tajawal-Medium',
      fontSize: 18,
      textAlign: isRTL ? 'right' : 'left',
      lineHeight: 30,
    },
    filterAndBooksCount: {
      paddingTop: 15,
      paddingBottom: 10,
      flexDirection: isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    booksCount: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 14,
      textAlign: 'right',
      color: colors.primaryBlack,
    },
    filterIcon: {
      width: 17,
      height: 17,
    },
    booksContainer: {
      marginBottom: 40,
      marginTop: 15,
      flexDirection: isRTL ? 'row' : 'row-reverse',
      flexWrap: 'wrap',
      columnGap: '5%',
      rowGap: 20,
    },
    addBtnStyle: {
      [isRTL ? 'left' : 'right']: 0,
      bottom: 80,
    },
    indicatorStyle: {
      top: 200,
    },
  });
};
