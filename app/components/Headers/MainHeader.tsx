import React, {useMemo} from 'react';
import {Text, View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import colors from '../../configs/colors';

interface MainHeaderProps {
  title: string;
  showBackIcon?: boolean;
  showSearchIcon?: boolean;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  showBackIcon,
  showSearchIcon,
}) => {
  const styles = useMemo(() => getStyles(), []);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.iconContainer}>
          {!!showBackIcon && (
            <Image
              source={require('../../assets/icons/Arrow_black.png')}
              resizeMode="contain"
              style={styles.headerBackIcon}
            />
          )}

          {!!showSearchIcon && (
            <Image
              source={require('../../assets/icons/searchIcon.png')}
              resizeMode="contain"
              style={styles.headerSearchIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    mainContainer: {
      paddingTop: 30,
      paddingBottom: 10,
    },
    innerContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      textAlign: 'center',
      fontFamily: 'ElMessiri-Bold',
      color: colors.primaryBlack,
    },
    iconContainer: {
      position: 'absolute',
      right: 10,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    headerBackIcon: {
      width: 8,
      height: 15,
    },
    headerSearchIcon: {
      width: 23,
      height: 23,
    },
  });
};
