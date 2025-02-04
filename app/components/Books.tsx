import React, {useMemo, useState} from 'react';
import {Image, ScrollView, Text, View, StyleSheet} from 'react-native';
import {ThereAreNoItemsComp} from './ThereAreNoItemsComp';
import colors from '../config';
import {Book} from './Book';

export const Books = () => {
  const [books] = useState<
    {key: number; bookCover?: any; bookName: string; benefitsCount: number}[]
  >([
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
      bookCover: require('../assets/images/bookTempCover.png'),
      bookName: 'ثلاثية غرناطة',
      benefitsCount: 7,
    },
    {
      key: 6,
      bookName: 'ثلاثية غرناطة',
      benefitsCount: 7,
    },
  ]);

  const styles = useMemo(() => getStyles(), []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.folderCount}>{`عدد الكتب :  ${books.length}`}</Text>
        <Image
          source={require('../assets/icons/filterIcon.png')}
          resizeMode="contain"
          style={styles.filterIcon}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {books.length > 0 ? (
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
        ) : (
          <ThereAreNoItemsComp
            imageSrc={require('../assets/images/thereAreNoBooks.png')}
            text="لا يوجد كتب هيا نبدأ!"
            subText="ابدأ التجربة وانقر الأيقونة بالأسفل وأنشئ كتاباً"
          />
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: '3.75%',
    },
    headerContainer: {
      paddingTop: 15,
      paddingBottom: 15,
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
      width: 17,
      height: 17,
    },
    booksContainer: {
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
