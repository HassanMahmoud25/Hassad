import React, {useMemo} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import colors from '../configs/colors';

interface ThereAreNoItemsCompProp {
  imageSrc: any;
  text: string;
  subText: string;
}

export const ThereAreNoItemsComp: React.FC<ThereAreNoItemsCompProp> = ({
  imageSrc,
  text,
  subText,
}) => {
  const styles = useMemo(() => getStyles(), []);

  return (
    <View style={styles.container}>
      <Image source={imageSrc} resizeMode="contain" style={styles.imageStyle} />
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>{text}</Text>
        <Text style={styles.subTextStyle}>{subText}</Text>
      </View>
    </View>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
    },
    textContainer: {
      width: '75%',
      alignSelf: 'center',
    },
    imageStyle: {
      maxWidth: '100%',
      height: 300,
    },
    textStyle: {
      fontFamily: 'Tajawal-Medium',
      fontSize: 24,
      color: colors.primaryBlack,
      textAlign: 'center',
      lineHeight: 36,
    },
    subTextStyle: {
      fontFamily: 'Tajawal-Regular',
      fontSize: 12,
      color: colors.subText,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: 5,
    },
  });
};
