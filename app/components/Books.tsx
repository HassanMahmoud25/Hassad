import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {ThereAreNoItemsComp} from './ThereAreNoItemsComp';
import colors from '../configs/colors';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider';
import {Book} from './Book';
import {getBooks} from '../services/booksService';

export const Books = () => {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);
  const [books, setBooks] = useState<
    {_id: string; img_url?: string; name: string; num_of_benefits: number}[]
  >([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
        const token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZjNGIwOTI4NDZlYTRjMmM2ZWYxNjI4IiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvIiwiaWF0IjoxNzI0MjI3MTk0fQ.iAjowbF9o8g2jnm-Dc0gJ7PMMPtLTyVzhhYKErwcewg';
        const books = await getBooks(token);
        setBooks(books);
      } catch (err) {
        console.log('fetchBooks ERROR ==> ', err);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.folderCount}>
          {t('books count', {count: books.length})}
        </Text>
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
        ) : (
          <>
            {books.length > 0 ? (
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
                imageSrc={require('../assets/images/thereAreNoBooks.png')}
                text="لا يوجد كتب هيا نبدأ!"
                subText="ابدأ التجربة وانقر الأيقونة بالأسفل وأنشئ كتاباً"
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
      paddingBottom: 15,
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
      width: 17,
      height: 17,
    },
    booksContainer: {
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
