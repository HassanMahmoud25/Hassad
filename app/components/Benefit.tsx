import React, {useMemo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '../configs/colors';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useRTL} from '../contexts/RTLProvider';
import {t} from 'i18next';

type ParamList = {
  // screen name: params passed to the screen
  benefitDetails: {
    benefit: {
      id: string;
      bookId: string;
      benefitTitle: string;
      benefitDate: string;
      benefitContent?: string;
      benefitImg?: string;
      pageNumber: number;
      bgColor: string;
      isFavorite?: boolean;
    };
  };
};

export const Benefit: React.FC<{
  id: string;
  bookId: string;
  benefitTitle: string;
  benefitDate: string;
  benefitContent?: string;
  benefitImg?: string;
  pageNumber: number;
  bgColor: string;
  borderColor?: string;
  isFavorite?: boolean;
}> = ({
  id,
  bookId,
  benefitTitle,
  benefitDate,
  benefitContent,
  benefitImg,
  pageNumber,
  bgColor,
  borderColor,
  isFavorite,
}) => {
  const navigation = useNavigation<NavigationProp<ParamList>>();

  const isRTL = useRTL();

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() =>
        navigation.navigate('benefitDetails', {
          benefit: {
            id,
            bookId,
            benefitTitle,
            benefitDate,
            benefitContent,
            benefitImg,
            pageNumber,
            bgColor,
            isFavorite,
          },
        })
      }
      style={[
        styles.benefitContainer,
        {backgroundColor: bgColor},
        isFavorite && {
          borderWidth: 2,
          borderColor: borderColor,
          [isRTL ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 0,
        },
      ]}>
      <View style={styles.benefitHeaderContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode={isRTL ? 'tail' : 'head'}
          style={styles.benefitTitle}>
          {benefitTitle}
        </Text>
        <Text style={styles.benefitDate}>{benefitDate}</Text>
      </View>

      <View style={styles.benefitBodyContent}>
        {!!benefitContent && (
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.benefitBodyText}>
            {benefitContent}
          </Text>
        )}

        {!!benefitImg && (
          <View style={styles.imgContainer}>
            <Image
              source={{uri: benefitImg}}
              resizeMode="cover"
              style={styles.benefitImgStyle}
            />
          </View>
        )}
      </View>

      <View style={styles.pageNumberContainer}>
        <Text style={styles.pageNumberText}>{`${t(
          'pageNumber',
        )} : ${pageNumber}`}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    benefitContainer: {
      borderRadius: 25,
      padding: 25,
      width: '100%',
    },
    benefitHeaderContainer: {
      flexDirection: isRTL ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    benefitTitle: {
      fontFamily: 'ElMessiri-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
      width: '75%',
      textAlign: isRTL ? 'left' : 'right',
    },
    benefitDate: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 12,
      color: colors.primaryBlack,
    },
    benefitBodyContent: {
      borderRightColor: colors.dimmed,
      borderRightWidth: 1,
      paddingLeft: 10,
      paddingVertical: 5,
      gap: 10,
    },
    benefitBodyText: {
      fontFamily: 'Tajawal-Regular',
      fontSize: 17,
      color: colors.labelText,
      textAlign: isRTL ? 'left' : 'right',
      lineHeight: 26,
    },
    imgContainer: {
      borderRadius: 10,
      overflow: 'hidden',
    },
    benefitImgStyle: {
      width: '100%',
      height: 120,
    },
    pageNumberContainer: {
      marginTop: 10,
      flexDirection: isRTL ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pageNumberText: {
      backgroundColor: colors.transparentWhite,
      borderRadius: 35,
      paddingVertical: 3,
      paddingHorizontal: 15,
      fontFamily: 'ElMessiri-SemiBold',
      fontSize: 11,
      color: colors.primaryBlack,
    },
  });
};
