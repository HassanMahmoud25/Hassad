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
} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import colors from '../configs/colors';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {AddComponent} from '../components/AddComponent';
import {Book} from '../components/Book';
import { useRTL } from '../contexts/RTLProvider';

type ParamList = {
  BookBenefitsScreen: {title: string};
};

export const FolderBooks = () => {
  const isRTL = useRTL();

  const [books] = useState([
    {
      key: 1,
      bookName: 'ثلاثية غرناطة ثلاثية غرناطة',
      benefitsCount: 7,
    },
    {
      key: 2,
      bookCover: require('../assets/images/bookTempCover.png'),
      bookName: 'ثلاثية غرناطة',
      benefitsCount: 7,
    },
    {
      key: 3,
      bookCover: require('../assets/images/bookTempCover.png'),
      bookName: 'ثلاثية غرناطة',
      benefitsCount: 7,
    },
    {
      key: 4,
      bookName: 'ثلاثية غرناطة',
      benefitsCount: 7,
    },
    {
      key: 5,
      bookName: 'ثلاثية غرناطة ثلاثية غرناطة',
      benefitsCount: 7,
    },
    {
      key: 6,
      bookCover: require('../assets/images/bookTempCover.png'),
      bookName: 'ثلاثية غرناطة',
      benefitsCount: 7,
    },
    {
      key: 7,
      bookCover: require('../assets/images/bookTempCover.png'),
      bookName: 'ثلاثية غرناطة',
      benefitsCount: 7,
    },
    {
      key: 8,
      bookName: 'ثلاثية غرناطة',
      benefitsCount: 7,
    },
  ]);

  const route = useRoute<RouteProp<ParamList, 'BookBenefitsScreen'>>();
  const {title} = route.params;

  const navigation = useNavigation();

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title={title} showBackIcon={true} />
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
            placeholder="ابحث عن كتاب"
            style={styles.searchInputField}
          />
        </View>

        <View style={styles.filterAndBooksCount}>
          <Text style={styles.booksCount}>{'عدد الكتب :  0'}</Text>
          <Image
            source={require('../assets/icons/filterIcon.png')}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.booksContainer}>
            {books.map(book => (
              <Book
                key={book.key}
                bookCover={book.bookCover}
                bookName={book.bookName}
                benefitsCount={book.benefitsCount}
              />
            ))}
          </View>
        </ScrollView>

        <AddComponent positionStyle={styles.addBtnStyle} />
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
      width: '92.5%',
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
  });
};
