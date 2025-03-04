import React, {useMemo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '../configs/colors';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useRTL} from '../contexts/RTLProvider';

type ParamList = {
  folderBooks: {title: string; id: string};
};

export const Folder: React.FC<{
  folderId: string;
  folderName: string;
  booksCount: number;
}> = ({folderId, folderName, booksCount}) => {
  const isRTL = useRTL();

  const navigation = useNavigation<NavigationProp<ParamList>>();

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => {
        navigation.navigate('folderBooks', {title: folderName, id: folderId});
      }}
      style={styles.mainContainer}>
      <View style={styles.folderCoverContainer}>
        <Image
          source={require('../assets/images/defaultFolderCover.png')}
          resizeMode="contain"
          style={styles.defaultFolderCover}
        />
        <TouchableOpacity style={styles.optionsIconContainer}>
          <Image
            source={require('../assets/icons/optionsIcon.png')}
            resizeMode="contain"
            style={styles.optionsIconStyle}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.folderNameAndBooksCountContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode={'tail'}
          style={styles.folderNameStyle}>
          {folderName}
        </Text>
        <Text style={styles.booksCountStyle}>{`${booksCount} كتب`}</Text>
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
    folderCoverContainer: {
      width: '100%',
      height: 115,
    },
    folderNameAndBooksCountContainer: {
      padding: 20,
    },
    defaultFolderCover: {
      width: '100%',
      height: 100,
      marginTop: 15,
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
    folderNameStyle: {
      fontFamily: 'ElMessiri-Bold',
      fontSize: 13,
      color: colors.primaryBlack,
      textAlign: isRTL ? 'left' : 'right',
    },
    booksCountStyle: {
      fontFamily: 'ElMessiri-SemiBold',
      fontSize: 11,
      color: colors.lightTextGrey,
      textAlign: isRTL ? 'left' : 'right',
      marginTop: 3,
    },
  });
};
