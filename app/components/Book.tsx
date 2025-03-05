import React, {useMemo, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '../configs/colors';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useRTL} from '../contexts/RTLProvider';
import {t} from 'i18next';

type ParamList = {
  bookBenefits: {title: string; id: string};
};

export const Book: React.FC<{
  bookId: string;
  bookCover?: string;
  bookName: string;
  benefitsCount: number;
}> = ({bookId, bookCover, bookName, benefitsCount}) => {
  const isRTL = useRTL();

  const navigation = useNavigation<NavigationProp<ParamList>>();

  const [showDefaultBookCover] = useState(!bookCover);

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() =>
        navigation.navigate('bookBenefits', {title: bookName, id: bookId})
      }
      style={styles.mainContainer}>
      <View
        style={[
          styles.bookCoverContainer,
          {
            backgroundColor: showDefaultBookCover
              ? colors.white
              : colors.lighterGrey,
          },
        ]}>
        {showDefaultBookCover ? (
          <Image
            source={require('../assets/images/defaultBookCover.png')}
            resizeMode="contain"
            style={styles.defaultBookCover}
          />
        ) : (
          <Image
            source={{uri: bookCover}}
            resizeMode="contain"
            style={styles.bookCoverStyle}
          />
        )}
        <TouchableOpacity style={styles.optionsIconContainer}>
          <Image
            source={require('../assets/icons/optionsIcon.png')}
            resizeMode="contain"
            style={styles.optionsIconStyle}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.booksNameAndBenefitsCountContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode={'tail'}
          style={styles.bookNameStyle}>
          {bookName}
        </Text>
        <Text style={styles.benefitsCountStyle}>{`${benefitsCount} ${t(
          'benefits',
        )}`}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    mainContainer: {
      width: '47.5%',
      backgroundColor: colors.white,
      borderRadius: 12,
      overflow: 'hidden',
    },
    bookCoverContainer: {
      width: '100%',
    },
    booksNameAndBenefitsCountContainer: {
      padding: 20,
    },
    bookCoverStyle: {
      width: '100%',
      height: 115,
    },
    defaultBookCover: {
      width: '100%',
      height: 95,
      marginTop: 20,
    },
    optionsIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 10,
      [isRTL ? 'right' : 'left']: 7.5,
      width: 20,
      height: 25,
    },
    optionsIconStyle: {
      width: 5,
      height: 16,
    },
    bookNameStyle: {
      fontFamily: 'ElMessiri-Bold',
      fontSize: 13,
      color: colors.primaryBlack,
      textAlign: isRTL ? 'left' : 'right',
    },
    benefitsCountStyle: {
      fontFamily: 'ElMessiri-SemiBold',
      fontSize: 11,
      color: colors.lightTextGrey,
      textAlign: isRTL ? 'left' : 'right',
      marginTop: 3,
    },
  });
};
