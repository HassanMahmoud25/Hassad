import React, {useMemo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '../configs/colors';
import {NavigationProp, useNavigation} from '@react-navigation/native';

type ParamList = {
  // screen name: params passed to the screen
  benefitDetails: undefined;
};

export const Benefit: React.FC<{
  benefitTitle: string;
  benefitDate: string;
  benefitContent?: string;
  benefitImg?: any;
  pageNumber: number;
  bgColor: string;
}> = ({
  benefitTitle,
  benefitDate,
  benefitContent,
  benefitImg,
  pageNumber,
  bgColor,
}) => {
  const navigation = useNavigation<NavigationProp<ParamList>>();

  const styles = useMemo(() => getStyles(), []);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('benefitDetails')}
      style={[styles.benefitContainer, {backgroundColor: bgColor}]}>
      <View style={styles.benefitHeaderContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
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
              source={benefitImg}
              resizeMode="cover"
              style={styles.benefitImgStyle}
            />
          </View>
        )}
      </View>

      <View style={styles.pageNumberContainer}>
        <Text
          style={styles.pageNumberText}>{`رقم الصفحة :  ${pageNumber}`}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    benefitContainer: {
      borderRadius: 25,
      padding: 25,
    },
    benefitHeaderContainer: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    benefitTitle: {
      fontFamily: 'ElMessiri-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
      width: '75%',
      textAlign: 'right',
    },
    benefitDate: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 12,
      color: colors.primaryBlack,
    },
    benefitBodyContent: {
      borderRightColor: colors.dimmed,
      borderRightWidth: 1,
      paddingRight: 10,
      paddingVertical: 5,
      gap: 10,
    },
    benefitBodyText: {
      fontFamily: 'Tajawal-Regular',
      fontSize: 17,
      color: colors.labelText,
      textAlign: 'right',
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
      flexDirection: 'row-reverse',
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
